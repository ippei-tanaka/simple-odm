import co from 'co';
import { expect } from 'chai';
import validator from 'validator';
import { Types } from '../../src/type';
import Schema from '../../src/schema';
import SchemaModel from '../../src/schema-model';

describe('SchemaData', function () {

    it('should check if value is a type object.', (done) => {
        co(function* () {

            const schema = new Schema({
                name: 'user',
                paths: {
                    email: {
                        type: Types.String,
                        required: true,
                        validate: function* (v) {
                            if (!validator.isEmail(v)) {
                                yield `"${v}" is not a valid email.`;
                            }
                        }
                    }
                }
            });

            const User = SchemaModel.createModel(schema);

            const user = new User({
                email: "test"
            });

            const result = user.examine();

            expect(result.email[0]).to.equal('"test" is not a valid email.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

});