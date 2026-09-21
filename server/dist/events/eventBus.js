"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.AppEvents = void 0;
const events_1 = __importDefault(require("events"));
var AppEvents;
(function (AppEvents) {
    AppEvents["USER_REGISTERED"] = "USER_REGISTERED";
    AppEvents["USER_INFO_CHANGE_REQUESTED"] = "USER_INFO_CHANGE_REQUESTED";
    AppEvents["PROPERTY_SUBMITTED"] = "PROPERTY_SUBMITTED";
    AppEvents["PROPERTY_APPROVED"] = "PROPERTY_APPROVED";
    AppEvents["PROPERTY_REJECTED"] = "PROPERTY_REJECTED";
    AppEvents["PROPERTY_EXPIRED"] = "PROPERTY_EXPIRED";
    AppEvents["PROPERTY_RENEWED"] = "PROPERTY_RENEWED";
    AppEvents["PROPERTY_VIEWED"] = "PROPERTY_VIEWED";
    AppEvents["ENQUIRY_CREATED"] = "ENQUIRY_CREATED";
    AppEvents["REQUIREMENT_SUBMITTED"] = "REQUIREMENT_SUBMITTED";
    AppEvents["REVIEW_SUBMITTED"] = "REVIEW_SUBMITTED";
    AppEvents["REVIEW_MODERATED"] = "REVIEW_MODERATED";
    AppEvents["VERIFICATION_REQUESTED"] = "VERIFICATION_REQUESTED";
    AppEvents["VERIFICATION_UPDATED"] = "VERIFICATION_UPDATED";
    AppEvents["ANALYTICS_EVENT"] = "ANALYTICS_EVENT";
})(AppEvents || (exports.AppEvents = AppEvents = {}));
class EventBus extends events_1.default {
    constructor() {
        super();
        this.setMaxListeners(50);
    }
    emitEvent(event, payload) {
        this.emit(event, payload);
    }
}
exports.eventBus = new EventBus();
