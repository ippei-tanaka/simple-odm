import co from 'co';
import { expect } from 'chai';
import validator from 'validator';
import { Types } from '../../src/type';
import Schema from '../../src/schema';
import ModelBuilder from '../../src/model-builder';
import EventHub from '../../src/event-hub';

describe('model', function ()
{

    const operator = {
        insertOne: () => Promise.resolve(true),
        updateOne: () => Promise.resolve(true)
    };

    const utils = {
        getIndexInfo: () => Promise.resolve(true)
    };

    it('should accept various validate attributes.', (done) =>
    {
        co(function* ()
        {
            const schema = new Schema({
                name: 'user',
                paths: {
                    email: {
                        required: true,
                        validate: function (v)
                        {
                            if (!validator.isEmail(v))
                            {
                                return `"${v}" is not a valid email.`;
                            }
                        }
                    },

                    age: {
                        required: true,
                        validate: function (v)
                        {
                            if (!validator.isNumeric(v))
                            {
                                return [`"${v}" is not a number.`];
                            }
                        }
                    },

                    gender: {
                        required: true,
                        validate: function* (v)
                        {
                            yield `Gender is not binary, though.`;

                            if (typeof v !== "boolean")
                            {
                                yield `"${v}" is not a boolean.`;
                            }
                        }
                    }
                }
            });

            const User = ModelBuilder.build({schema, operator, utils});

            const model = new User({
                email: "test",
                age: "a",
                gender: 2
            });

            let error;

            try {
                yield model.save();
            } catch (e) {
                error = e;
            }

            expect(error.email[0]).to.equal('"test" is not a valid email.');
            expect(error.age[0]).to.equal('"a" is not a number.');
            expect(error.gender[0]).to.equal('Gender is not binary, though.');
            expect(error.gender[1]).to.equal('"2" is not a boolean.');

            done();

        }).catch((e) =>
        {
            done(e);
        });
    });

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

            const User = ModelBuilder.build({schema, operator, utils});

            const model = new User({
                email: "test"
            });

            let error;

            try {
                yield model.save();
            } catch (e) {
                error = e;
            }

            expect(error.email[0]).to.equal('"test" is not a valid email.');

            done();

        }).catch((e) =>
        {
            done(e);
        });
    });

    it('should let BEFORE_SAVE hook modify the model values.', (done) =>
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

            EventHub.on(schema.BEFORE_SAVED, model =>
            {
                model.addOverriddenValues({
                    email: model.getValues().email + "?",
                    age: 20
                });
            });

            const User = ModelBuilder.build({schema, operator, utils});

            const model = new User({
                email: "test"
            });

            let error;

            try {
                yield model.save();
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an('undefined');
            expect(model.getValues().email).to.equal("test?");
            expect(model.getValues().age).to.equal(20);

            done();

        }).catch((e) =>
        {
            done(e);
        });
    });

    it('should let BEFORE_SAVE hook modify the error messages.', (done) =>
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

            EventHub.on(schema.BEFORE_SAVED, model =>
            {
                model.setOverriddenErrors(Object.assign({}, model.getErrors(), {
                    fake_password: ["Boo!"]
                }));
            });

            EventHub.on(schema.BEFORE_SAVED, model => new Promise((resolve) =>
            {
                setTimeout(() =>
                {
                    model.setOverriddenErrors(Object.assign({}, model.getErrors(), {
                        fake_email: ["Oh, no!", "You added something new!"]
                    }));
                    resolve();
                }, 100);
            }));

            EventHub.on(schema.BEFORE_SAVED, model => co(function* ()
            {
                yield new Promise((resolve) =>
                {
                    setTimeout(() =>
                    {
                        model.addOverriddenErrors({
                            fake_age: ["Ho ho!"]
                        });
                        resolve();
                    }, 100);
                });
            }));

            const User = ModelBuilder.build({schema, operator, utils});

            const model = new User({
                email: "test"
            });

            let error;

            try {
                yield model.save();
            } catch (e) {
                error = e;
            }

            expect(error.fake_email[0]).to.equal("Oh, no!");
            expect(error.fake_email[1]).to.equal("You added something new!");
            expect(error.fake_password[0]).to.equal("Boo!");
            expect(error.fake_age[0]).to.equal("Ho ho!");

            done();
        }).catch((e) =>
        {
            done(e);
        });
    });

});