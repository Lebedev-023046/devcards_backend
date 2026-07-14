import { BadRequestException, ValidationError } from '@nestjs/common';

export function createValidationException(errors: ValidationError[]) {
  return new BadRequestException({
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details: {
      fieldErrors: collectFieldErrors(errors),
    },
  });
}

function collectFieldErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((acc, error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      acc[path] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(acc, collectFieldErrors(error.children, path));
    }

    return acc;
  }, {});
}
