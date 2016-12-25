[![Build Status](https://travis-ci.org/ippei-tanaka/simple-odm.svg?branch=master)](https://travis-ci.org/ippei-tanaka/simple-odm)

# Simple ODM

Simple ODM is an object-document mapper for NoSQL databases. It only supports MongoDB now.

### Instrallation

To install Simple ODM:

```sh
$ npm install simple-odm --save
```

## Get started

### Schema, Model, and Driver

First, you need to create a schema:

```js
import { MongoSchema } from 'simple-odm';

const schema = new MongoSchema({
    name: 'user',
    paths: {
        account_name: {
            required: true
        }
    }
});
```

Then, create your model class by:
- extending MongoModel class
- overridding schema getter with the schema you created

```js
import { MongoModel } from 'simple-odm';

class User extends MongoModel
{
    static get schema () {
        return schema;
    };
}
```

You also need to setup a DB driver:

```js
import { mongoDriver } from 'simple-odm';

mongoDriver.setUp({
    database: 'my-database'
});
```

### Persist Data

```js
const user = new User({
    account_name: "John"
});

try {
    user.save().then(() => {
        User.findMany().then(users => {
            const newUser = users[0];
            console.log(newUser.values.account_name); // John
        });
    });
} catch (e) {
    // Error Handling
}
```

### License

MIT