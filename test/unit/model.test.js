import co from 'co';
import { expect } from 'chai';
import validator from 'validator';
import { Types } from '../../src/type';
import Schema from '../../src/schema';
import ModelBuilder from '../../src/model-builder';

describe('model', function ()
{
    describe('findMany()', function ()
    {
        it('should return a list of models.', (done) =>
        {
            co(function* ()
            {
                const schema = new Schema({
                    name: 'user',
                    paths: {
                        email: {
                            required: true
                        }
                    }
                });

                const operator = {
                    findMany: () => Promise.resolve([
                        {email: "aaa"},
                        {email: "bbb"},
                        {email: "ccc"}
                    ])
                };

                const User = ModelBuilder.buildModel({operator, schema});

                const models = yield User.findMany();

                /*
                expect(models[0]).to.be.an('undefined');
                expect(error.fake_email[0]).to.equal("Oh, no!");
                expect(error.fake_email[1]).to.equal("You added something new!");
                */

                done();
            }).catch((e) =>
            {
                done(e);
            });
        });
    });

    describe('save()', function ()
    {
        it('should throw an error if values have invalid data.', (done) =>
        {
            co(function* ()
            {
                const schema = new Schema({
                    name: 'user',
                    paths: {
                        email: {
                            type: Types.String,
                            required: true,
                            validate: function* (v)
                            {
                                if (!validator.isEmail(v))
                                {
                                    yield `"${v}" is not a valid email.`;
                                }
                            }
                        }
                    }
                });

                const operator = {
                    insertOne: (v) => Promise.resolve(null)
                };

                const User = ModelBuilder.buildModel({operator, schema});

                const model = new User({
                    email: "test"
                });

                let error;
                let response;

                try
                {
                    response = yield model.save();
                } catch (e)
                {
                    error = e || null;
                }

                expect(response).to.be.an('undefined');
                expect(error.email[0]).to.equal('"test" is not a valid email.');

                done();

            }).catch((e) =>
            {
                done(e);
            });
        });

        it('should create a model.', (done) =>
        {
            co(function* ()
            {
                const schema = new Schema({
                    name: 'user',
                    paths: {
                        email: {
                            type: Types.String,
                            required: true
                        }
                    }
                });

                schema.on(Schema.ON_SAVE, data => Promise.resolve(data));

                const operator = {
                    insertOne: (v) => Promise.resolve("Would save the model to the DB!")
                };

                const User = ModelBuilder.buildModel({operator, schema});

                const model = new User({
                    email: "test"
                });

                let error;
                let response;

                try
                {
                    response = yield model.save();
                } catch (e)
                {
                    error = e || null;
                }

                expect(error).to.be.an('undefined');
                expect(response).to.equal("Would save the model to the DB!");

                done();

            }).catch((e) =>
            {
                done(e);
            });
        });

        it('should let ON_SAVE hook modify the error messages.', (done) =>
        {
            co(function* ()
            {
                const schema = new Schema({
                    name: 'user',
                    paths: {
                        email: {
                            required: true
                        }
                    }
                });

                schema.on(Schema.ON_SAVE, (model) => co(function* ()
                {
                    model.setErrors({
                        fake_email: ["Oh, no!", "You added something new!"]
                    });
                }));

                const operator = {
                    insertOne: (v) => Promise.resolve("Would save the model to the DB!")
                };

                const User = ModelBuilder.buildModel({operator, schema});

                const model = new User({
                    email: "test"
                });

                let error;
                let response;

                try
                {
                    response = yield model.save();
                } catch (e)
                {
                    error = e || null;
                }

                expect(response).to.be.an('undefined');
                expect(error.fake_email[0]).to.equal("Oh, no!");
                expect(error.fake_email[1]).to.equal("You added something new!");

                done();
            }).catch((e) =>
            {
                done(e);
            });
        });

    });

});