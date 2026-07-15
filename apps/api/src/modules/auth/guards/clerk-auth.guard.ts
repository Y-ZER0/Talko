import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { clerkClient, verifyToken } from "@clerk/clerk-sdk-node";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { UsersService } from "../../users/users.service";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException("Missing authorization token");
    }

    try {
      const secretKey = this.configService.get<string>("app.clerkSecretKey");
      if (!secretKey) {
        throw new UnauthorizedException("Clerk is not configured");
      }

      const verifiedSession = await verifyToken(token, { secretKey });
      let user = await this.usersService.findByClerkId(verifiedSession.sub);

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(verifiedSession.sub);
        user = await this.usersService.upsert({
          id: clerkUser.id,
          username:
            clerkUser.username ??
            clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
            `user_${clerkUser.id.slice(-8)}`,
          imageUrl: clerkUser.imageUrl ?? undefined,
        });
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}
