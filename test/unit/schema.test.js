import co from 'co';
import { expect } from 'chai';
import Schema from '../../src/schema';
import { Types } from '../../src/type';
import { SimpleOdmError } from '../../src/errors';

describe('Schema', function () {
    it('should throw an error if some arguments are invalid.', (done) => {
        co(function* () {
            let error;

            try {
                new Schema({
                    name: 0
                });
            } catch (e) {
                error = e || null;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('A schema name has to be string.');

            error = null;

            try {
                new Schema({
                    name: 'user',
                    paths: () => {}
                });
            } catch (e) {
                error = e || null;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('A paths argument has to be an object.');

            error = null;

            try {
                new Schema({
                    name: 'user',
                    paths: []
                });
            } catch (e) {
                error = e || null;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('A paths argument has to be an object.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should create a schema.', (done) => {
        co(function* () {
            const schema = new Schema({
                name: 'user',
                paths: {
                    email: {
                        type: Types.String,
                        required: true
                    }
                }
            });

            expect(schema.paths.email.type).to.equal(Types.String);

            done();
        }).catch((e) => {
            done(e);
        });
    });
});