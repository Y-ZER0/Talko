import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>("app.port", 3001);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix("api");

  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
}
bootstrap();
