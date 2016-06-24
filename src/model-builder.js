import co from 'co';
import Model from './model';

class ModelBuilder {

    static build ({operator, driver, schema, utils})
    {
        const obj = Model.bind(Model, {operator, driver, schema, utils});

        for (let key of Object.getOwnPropertyNames(Model))
        {
            if (typeof Model[key] === "function")
            {
                obj[key] = Model[key].bind(Model, {operator, driver, schema, utils});
            }
        }

        return Object.freeze(obj);
    }

}

export default Object.freeze(ModelBuilder);