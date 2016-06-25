import ModelBuilder from './model-builder';
import MongoUtils from './mongo-utils';
import MongoDriver from './mongo-driver';
import MongoCrudOperator from './mongo-crud-operator';

class MongoModelBuilder extends ModelBuilder {

    static build ({schema})
    {
        return super.build({
            schema,
            driver: MongoDriver,
            operator: MongoCrudOperator,
            utils: MongoUtils
        });
    }

}

export default Object.freeze(MongoModelBuilder);