import co from 'co';
import Model from './model';

class ModelBuilder {

    static buildModel ({operator, schema})
    {
        const firstArg = {operator, schema};
        const BindModel = Model.bind(Model, firstArg);

        for (let key of Object.getOwnPropertyNames(Model))
        {
            if (typeof Model[key] === "function")
            {
                BindModel[key] = Model[key].bind(BindModel, firstArg);
            }
        }

        return Object.freeze(BindModel);
    }

}

Object.freeze(ModelBuilder);

export default ModelBuilder;