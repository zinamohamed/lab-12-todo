require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    const task = {
      'todo': 'make coffee',
      'completed': true,
    };

    const dbTask = {
      ...task,
      'owner_id': 2,
      'id':4,
    };

    test('create a task', async() => {
      const task = {
        'todo': 'make coffee',
        'completed': true,
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(task)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(dbTask);
    });

    test('returns todo item for a givowner', async() => {
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbTask]);
    });
    
    test('returns a single todo item', async() => {

      const data = await fakeRequest(app)
        .get('/api/todos/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(dbTask);

    });

    test('updates existing todo item', async() => {
      
      const newTask = {
        todo: 'sweep floors',
        completed:true,
      };
      
      
      const updatedTask = {
        'todo': 'sweep floors',
        'completed': true,
        'id': 1,
        'owner_id':1
      };
      
    
      const data = await fakeRequest(app)
        .put('/api/todos/1')
        .set('Authorization', token)
        .send(newTask)
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body[0]).toEqual(updatedTask);
    });
  });
});
