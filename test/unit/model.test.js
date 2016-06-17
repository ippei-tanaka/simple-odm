import co from 'co';
import { expect } from 'chai';
import validator from 'validator';
import { Types } from '../../src/type';
import Schema from '../../src/schema';
import SchemaData from '../../src/schema-data';
import ModelBuilder from '../../src/model-builder';

describe('model', function ()
{

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

        it('should throw an error if onCreate hook returns a non-SchemaData object as the value of its resolved Promise.', (done) =>
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
                    },
                    onCreate: (data) => Promise.resolve(null)
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
                expect(error.message).to
                                     .equal('The value of the resolved Promise object returned from onCreate has to be a SchemaData object.');
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
                    },
                    onCreate: data => Promise.resolve(data)
                });

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

        it('should let onCreate return a new SchemeData object.', (done) =>
        {
            co(function* ()
            {
                const schema = new Schema({
                    name: 'user',
                    paths: {
                        email: {
                            required: true
                        }
                    },
                    onCreate: data => co(function* ()
                    {
                        return new SchemaData({
                            values: data.values,
                            errorMessages: {
                                fake_email: ["Oh, no!", "You added something new!"]
                            }
                        })
                    })
                });

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