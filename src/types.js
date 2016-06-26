import Type from './type';

export default Object.freeze({
    String: new Type("String"),
    Integer: new Type("Integer"),
    Date: new Type("Date"),
    Boolean: new Type("Boolean"),
    MongoObjectID: new Type("MongoObjectID"),
    UUID: new Type("UUID")
});