import Ember from 'ember';

export default Ember.Component.extend({
  active: false,
  attributeBindings: ['style'],
  classNames: ['image-drop'],
  classNameBindings: [
    'active',
    'circle:is-circular',
    'isDraggingOnApp:is-dragging',
    'hasImage',
  ],
  droppedImage: null,
  helpText: "Drop your image here.",
  originalImage: null,

  appDragState: Ember.inject.service('dragState'),

  hasDroppedImage: Ember.computed.notEmpty('droppedImage'),
  hasImage: Ember.computed.or('hasDroppedImage', 'hasOriginalImage'),
  hasOriginalImage: Ember.computed.notEmpty('originalImage'),
  isDraggingOnApp: Ember.computed.alias('appDragState.isDragging'),

  style: Ember.computed('droppedImage', 'originalImage', function() {
    let backgroundStyle = "";

    if (this.get('droppedImage')) {
      backgroundStyle = `background-image: url(${this.get('droppedImage')});`;
    } else if (this.get('originalImage')) {
      backgroundStyle = `background-image: url(${this.get('originalImage')});`;
    }

    return Ember.String.htmlSafe(backgroundStyle);
  }),

  setup: Ember.on('willInsertElement', function() {
    const $input = this.$('input');
    $input.on('change', (event) => {
      this.handleFileDrop(event.target.files[0]);
    });
  }),

  convertImgToBase64URL(url, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'), dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
  },

  dragEnded() {
    this.dragLeave();
    this.get('appDragState').leaving();
  },

  dragLeave() {
    this.set('active', false);
  },

  dragOver() {
    this.set('active', true);
  },

  drop(event) {
    event.preventDefault();

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      return this.handleFileDrop(event.dataTransfer.files[0]);
    }

    let imageUrl = event.dataTransfer.getData('URL');
    if (!imageUrl) {
      return;
    }

    this.convertImgToBase64URL(imageUrl, (base64) => {
      this.set('droppedImage', base64);
    });
  },

  handleFileDrop(file) {
    if (file == null) {
      return;
    }

    this.set('file', file);
    var reader = new FileReader();
    reader.onload = (e) => {
      var fileToUpload = e.target.result;
      Ember.run(() => {
        this.set('droppedImage', fileToUpload);
        this.dragEnded();
      });
    };

    reader.readAsDataURL(file);
  },
});
