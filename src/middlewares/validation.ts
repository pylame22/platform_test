import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

type ErrorMessageType = Record<string, string[]>;

interface IErrorMessage {
    error: string;
    details: ErrorMessageType;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateSchema = (schema: z.ZodObject<any, any>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (zodError) {
            let error = "Internal Server Error";
            const details: ErrorMessageType = {};
            if (zodError instanceof ZodError) {
                error = "Invalid data";
                zodError.errors.forEach((issue) => {
                    const path = issue.path.join(".");
                    if (!details[path]) details[path] = [];
                    details[path].push(issue.message);
                });
            }
            const errorMessage: IErrorMessage = { error, details };
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorMessage);
        }
    };
};

export default validateSchema;
