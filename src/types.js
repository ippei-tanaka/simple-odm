import Type from './type';

const _types = {
    String: new Type("String"),
    Integer: new Type("Integer"),
    Date: new Type("Date"),
    Boolean: new Type("Boolean"),
    MongoObjectID: new Type("MongoObjectID"),
    UUID: new Type("UUID")
};

export default class Types {

    /**
     * @type {Type}
     */
    static get String ()
    {
        return _types.String;
    }

    /**
     * @type {Type}
     */
    static get Integer ()
    {
        return _types.Integer;
    }

    /**
     * @type {Type}
     */
    static get Date ()
    {
        return _types.Date;
    }

    /**
     * @type {Type}
     */
    static get Boolean ()
    {
        return _types.Boolean;
    }

    /**
     * @type {Type}
     */
    static get MongoObjectID ()
    {
        return _types.MongoObjectID;
    }

    /**
     * @type {Type}
     */
    static get UUID ()
    {
        return _types.UUID;
    }

}