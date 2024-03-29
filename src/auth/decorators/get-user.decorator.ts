import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest()
        const user = request.user

        if( !user )
            throw new InternalServerErrorException('Missing User in request')

        return ( data && user[data] )
            ? user[data]
            : user
    }
)