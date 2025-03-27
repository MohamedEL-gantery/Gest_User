import { BadRequestAppException } from "@/libs/http";
import type { NextApiResponse } from "next";
import { UAParser } from "ua-parser-js";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
} from "@/libs/nosql-db/contracts/enums";

export function parseUserAgent(userAgent: string = "") {
  const ua = new UAParser(userAgent);
  let browser = (ua.getBrowser().name || "Unknown") as BrowserEnum;
  let device = (ua.getDevice().type || "Desktop") as DeviceEnum;
  let operatingSystem = (ua.getOS().name || "Unknown") as OperatingSystemEnum;

  if (!browser || browser === "Unknown") browser = BrowserEnum.Other;
  if (!device || device === "Unknown") device = DeviceEnum.Unknown;
  if (!operatingSystem || operatingSystem === "Unknown")
    operatingSystem = OperatingSystemEnum.Unknown;

  return {
    browser,
    device,
    operatingSystem,
  };
}

export function handleError(res: NextApiResponse, error: Error) {
  const appError = BadRequestAppException.handle(error);
  return res.status(appError.statusCode).json({
    statusCode: appError.statusCode,
    message: appError.message,
    status: appError.status,
    isOperational: appError.isOperational,
    stack: appError.stack,
  });
}

export function handleValidationOrServerError(
  res: NextApiResponse,
  error: Error
) {
  if (Array.isArray(error)) {
    return res
      .status(400)
      .json(
        validationErrorResponse(
          error.map((err) => Object.values(err.constraints)).flat() as string[]
        )
      );
  }
  return handleError(res, error);
}

export function validationErrorResponse(errors: string[]) {
  return {
    statusCode: 400,
    status: "fail",
    message: "Validation failed",
    errors,
  };
}
