import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessageMediaType } from "@repo/shared";

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {}

  async uploadToImageKit(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; fileId: string; mediaType: MessageMediaType }> {
    const publicKey = this.configService.get<string>("app.imagekit.publicKey");
    const privateKey = this.configService.get<string>("app.imagekit.privateKey");
    const urlEndpoint = this.configService.get<string>("app.imagekit.urlEndpoint");

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error("ImageKit credentials not configured");
    }

    const ImageKit = await this.getImageKit();
    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    const result = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder,
      useUniqueFileName: true,
    });

    return {
      url: result.url,
      fileId: result.fileId,
      mediaType: this.classify(file.mimetype),
    };
  }

  buildTransformedUrl(baseUrl: string, transform: string): string {
    return `${baseUrl}?tr=${transform}`;
  }

  private classify(mimetype: string): MessageMediaType {
    if (mimetype.startsWith("image/")) return MessageMediaType.IMAGE;
    if (mimetype.startsWith("audio/")) return MessageMediaType.AUDIO;
    if (mimetype.startsWith("video/")) return MessageMediaType.VIDEO;
    return MessageMediaType.DOCUMENT;
  }

  private async getImageKit(): Promise<{
    new (config: {
      publicKey: string;
      privateKey: string;
      urlEndpoint: string;
    }): {
      upload(options: {
        file: Buffer;
        fileName: string;
        folder: string;
        useUniqueFileName: boolean;
      }): Promise<{ url: string; fileId: string }>;
    };
  }> {
    try {
      const mod = await import("imagekit");
      return mod.default || mod;
    } catch {
      throw new Error(
        "ImageKit SDK not installed. Run: pnpm add imagekit --filter api",
      );
    }
  }
}
