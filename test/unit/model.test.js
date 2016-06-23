import co from 'co';
import { expect } from 'chai';
import validator from 'validator';
import { Types } from '../../src/type';
import Schema from '../../src/schema';
import ModelBuilder from '../../src/model-builder';
import EventHub from '../../src/event-hub';

describe('model', function ()
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

            const User = ModelBuilder.build(schema);

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
                model.addValues({
                    email: model.getValues().email + "?",
                    age: 20
                });
            });

            const User = ModelBuilder.build(schema);

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
                model.setErrors(Object.assign({}, model.getErrors(), {
                    fake_password: ["Boo!"]
                }));
            });

            EventHub.on(schema.BEFORE_SAVED, model => new Promise((resolve) =>
            {
                setTimeout(() =>
                {
                    model.setErrors(Object.assign({}, model.getErrors(), {
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
                        model.addErrors({
                            fake_age: ["Ho ho!"]
                        });
                        resolve();
                    }, 100);
                });
            }));

            const User = ModelBuilder.build(schema);

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

    it('should not let users manually modify the model errors before they were modified by the model.', (done) =>
    {
        co(function* ()
        {
            const schema = new Schema({
                name: 'user',
                paths: {
                    email: {}
                }
            });

            const User = ModelBuilder.build(schema);

            const model = new User({
                email: "test"
            });

            let error;

            try {
                yield model.setErrors({
                    email: "Oh!"
                });
            } catch (e) {
                error = e;
            }

            expect(error.message).to.equal("Errors of a model can't be modified manually before inspected.");

            done();

        }).catch((e) =>
        {
            done(e);
        });
    });

});