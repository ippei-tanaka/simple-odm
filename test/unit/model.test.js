import { expect } from 'chai';
import validator from 'validator';
import types from '../../src/types';
import Schema from '../../src/schema';
import Model from '../../src/model';
import EventHub from '../../src/event-hub';

describe('model', function ()
{

    it('should have the default value.', async () =>
    {
        const schema = new Schema({
            name: 'user',
            paths: {
                age: {
                    type: types.Integer,
                    default_value: 20
                }
            }
        });

        class User extends Model {

            static get schema ()
            {
                return schema;
            }

        }

        const model = new User({});

        expect(model.values.age).to.equal(20);
    });

    it('should accept various validate attributes.', async () =>
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

        class User extends Model {

            static get schema ()
            {
                return schema;
            }

        }

        const model = new User({
            email: "test",
            age: "a",
            gender: 2
        });

        let error;

        try
        {
            await model.save();
        }
        catch (e)
        {
            error = e;
        }

        expect(error.message.email[0]).to.equal('"test" is not a valid email.');
        expect(error.message.age[0]).to.equal('"a" is not a number.');
        expect(error.message.gender[0]).to.equal('Gender is not binary, though.');
        expect(error.message.gender[1]).to.equal('"2" is not a boolean.');
    });

    it('should throw an error if values have invalid data.', async () =>
    {
        const schema = new Schema({
            name: 'user',
            paths: {
                email: {
                    type: types.String,
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

        class User extends Model {

            static get schema ()
            {
                return schema;
            }

        }

        const model = new User({
            email: "test"
        });

        let error;

        try
        {
            await model.save();
        }
        catch (e)
        {
            error = e;
        }

        expect(error.message.email[0]).to.equal('"test" is not a valid email.');
    });

    it('should let BEFORE_SAVE hook modify the model values.', async () =>
    {
        const schema = new Schema({
            name: 'user',
            paths: {
                email: {
                    type: types.String,
                    required: true
                }
            }
        });

        EventHub.on(schema.BEFORE_SAVED, ({values}) =>
        {
            values.age = 20;
            values.email += "?";
            return {values};
        });

        class User extends Model {

            static get schema ()
            {
                return schema;
            }

        }

        const model = new User({
            email: "test"
        });

        let error;

        try
        {
            await model.save();
        }
        catch (e)
        {
            error = e;
        }

        expect(error).to.be.an('undefined');
        expect(model.values.email).to.equal("test?");
        expect(model.values.age).to.equal(20);
    });

    it('should let BEFORE_SAVE hook modify the values and error messages.', async () =>
    {
        const schema = new Schema({
            name: 'user',
            paths: {
                email: {
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

        EventHub.on(schema.BEFORE_SAVED, ({errors}) =>
        {
            errors.fake_password = ["Boo!"];
            return {errors};
        });

        EventHub.on(schema.BEFORE_SAVED, ({errors}) => new Promise((resolve) =>
        {
            setTimeout(() =>
            {
                errors.fake_email = ["Oh, no!", "You added something new!"];
                resolve({errors});
            }, 100);
        }));

        EventHub.on(schema.BEFORE_SAVED, async ({errors}) =>
        {
            await new Promise((resolve) =>
            {
                setTimeout(() =>
                {
                    errors.fake_age = ["Ho ho!"];
                    resolve({errors});
                }, 100);
            });
        });

        class User extends Model {

            static get schema ()
            {
                return schema;
            }

        }

        const model = new User({
            email: "test"
        });

        let error;

        try
        {
            await model.save();
        }
        catch (e)
        {
            error = e;
        }

        expect(error.message.email[0]).to.equal('"test" is not a valid email.');
        expect(error.message.fake_email[0]).to.equal("Oh, no!");
        expect(error.message.fake_email[1]).to.equal("You added something new!");
        expect(error.message.fake_password[0]).to.equal("Boo!");
        expect(error.message.fake_age[0]).to.equal("Ho ho!");
    });

    it('should not let the values be replaced.', async () =>
    {
        const schema = new Schema({
            name: 'user',
            paths: {
                email: {}
            }
        });

        class User extends Model {

            static get schema ()
            {
                return schema;
            }

        }

        const model = new User({
            email: "test"
        });

        let error;

        try
        {
            //noinspection JSUnresolvedVariable
            model.values = {};
        }
        catch (e)
        {
            error = e || null;
        }

        expect(error.message).to.match(/^Cannot set property values of (#<Model>|\[object Object]) which has only a getter$/);
    });

    it('should not let the id be modified.', async () =>
    {
        class _Schema extends Schema {

            get primaryPathName ()
            {
                return "_my_id_prop";
            }
        }

        const schema = new _Schema({
            name: 'user',
            paths: {
                email: {}
            }
        });

        class User extends Model {

            static get schema ()
            {
                return schema;
            }

        }

        const model = new User({
            email: "test"
        });

        expect(model.values._my_id_prop).to.be.an('undefined');

        let error;

        try
        {
            model.values._my_id_prop = 123;
        }

        catch (e)
        {
            error = e;
        }

        expect(error.message).to.match(/^Cannot set property _my_id_prop of (#<Object>|\[object Object]) which has only a getter$/);
    });

});