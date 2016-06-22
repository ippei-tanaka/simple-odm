import co from 'co';
import Model from './model';

class ModelBuilder {

    static build ({operator, schema})
    {
        const firstArg = {operator, schema};
        const BindModel = Model.bind(Model, firstArg);

        for (let key of Object.getOwnPropertyNames(Model))
        {
            if (typeof Model[key] === "function")
            {
                BindModel[key] = Model[key].bind(Model, firstArg);
            }
        }

        return Object.freeze(BindModel);
    }

}

export default Object.freeze(ModelBuilder);