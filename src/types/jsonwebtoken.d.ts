
declare module 'jsonwebtoken' {
  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: jwt.Secret,
    options?: jwt.SignOptions
  ): string;
}
