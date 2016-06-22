import co from 'co';
import Model from './model';

class ModelBuilder {

    static build (schema)
    {
        return Object.freeze(Model.bind(Model, schema));
    }

}

export default Object.freeze(ModelBuilder);