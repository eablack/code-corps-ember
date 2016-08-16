import Ember from "ember";
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

let application;

module('Acceptance: Signup', {
  beforeEach: function() {
    application = startApp();
  },
  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('Signup form is accessible from the main site', (assert) => {
  assert.expect(2);

  visit('/');

  andThen(() => {
    assert.equal(find('a.signup').length, 1, 'Link to sign-up route is visible');
    click('a.signup');
  });

  andThen(() => {
    assert.equal(currentPath(), 'signup');
  });
});

test('Successful signup', (assert) => {
  assert.expect(6);

  visit('/signup');

  andThen(function() {
    fillIn('[name=username]', 'username');
    fillIn('[name=email]', 'email@example.com');
    fillIn('[name=password]', 'password');
    click('[name=signup]');
  });

  let signUpDone = assert.async();

  server.post('/users/', (db, request) => {
    let params = JSON.parse(request.requestBody).data.attributes;
    params["state"] = "signed_up";

    assert.equal(params.username, 'username');
    assert.equal(params.email, 'email@example.com');
    assert.equal(params.password, 'password');

    signUpDone();

    return db.create('user', params);
  });

  let signInDone = assert.async();

  server.post('/login', function(db, request) {
    let json = request.requestBody;

    assert.ok(json.indexOf('"username":"email@example.com"') > -1);
    assert.ok(json.indexOf('"password":"password"') > -1);

    signInDone();

    return {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6InBhc3N3b3JkIiwidXNlcm5hbWUiOiJqb3NoQGNvZGVybHkuY29tIiwidXNlcl9pZCI6MSwiZXhwIjo3MjAwfQ.QVDyAznECIWL6DjDs9iPezvMmoPuzDqAl4bQ6CY-fCQ",
      user_id: 1,
    };
  });

  andThen(() => {
    assert.equal(currentURL(), '/start/hello');
  });
});

test('Failed signup due to invalid data stays on same page', (assert) => {
  assert.expect(1);

  visit('/signup');

  andThen(() => {
    click('[name=signup]');
  });

  andThen(() => {
    assert.equal(currentURL(), '/signup');
  });
});
