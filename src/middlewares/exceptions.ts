import { StatusCodes } from "http-status-codes";
import { PlatformError } from "utils/exceptions";
import { NextFunction, Request, Response } from "express";

export const exceptionMiddleware = async (
    error: Error,
    request: Request,
    response: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
): Promise<void> => {
    if (error instanceof PlatformError) {
        response.status(StatusCodes.BAD_REQUEST).send({ message: error.message });
    } else {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
        throw error;
    }
};
