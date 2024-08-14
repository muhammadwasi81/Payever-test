import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { expect } from 'chai';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/users (POST)', async () => {
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(newUser)
      .expect(201);

    expect(response.body).to.be.an('object');
    expect(response.body.firstName).to.equal(newUser.firstName);
    expect(response.body.lastName).to.equal(newUser.lastName);
    expect(response.body.email).to.equal(newUser.email);
  });

  it('/api/users (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .expect(200);

    expect(response.body).to.be.an('array');
  });

  it('/api/users/:id (GET)', async () => {
    const newUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .send(newUser)
      .expect(201);

    const userId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .get(`/api/users/${userId}`)
      .expect(200);

    expect(response.body).to.be.an('object');
    expect(response.body.id).to.equal(userId);
    expect(response.body.firstName).to.equal(newUser.firstName);
    expect(response.body.lastName).to.equal(newUser.lastName);
    expect(response.body.email).to.equal(newUser.email);
  });
});
