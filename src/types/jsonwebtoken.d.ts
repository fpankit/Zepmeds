
declare module 'jsonwebtoken' {
    export function sign(
        payload: string | Buffer | object,
        secretOrPrivateKey: jwt.Secret,
        options?: jwt.SignOptions
    ): string;

    export function verify(
        token: string,
        secretOrPublicKey: jwt.Secret | jwt.GetPublicKeyOrSecret,
        options?: jwt.VerifyOptions & { complete?: false }
    ): string | object;
}
