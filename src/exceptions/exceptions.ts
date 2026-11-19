export class ForbiddenException extends Error {
    constructor(message = "Forbidden") {
        super(message);
        this.name = "ForbiddenException";
    }
}