export class PlatformError extends Error {}

export class NotEnoughBalanceError extends PlatformError {
    constructor() {
        const message = "NotEnoughBalanceError";
        super(message);
        this.name = message;
    }
}

export class AssetDoesNotExists extends PlatformError {
    constructor() {
        const message = "AssetDoesNotExists";
        super(message);
        this.name = message;
    }
}

export class ClientDoesNotExists extends PlatformError {
    constructor() {
        const message = "ClientDoesNotExists";
        super(message);
        this.name = message;
    }
}

export class LiquidityPoolNotExists extends PlatformError {
    constructor() {
        const message = "LiquidityPoolNotExists";
        super(message);
        this.name = message;
    }
}

export class NotMarketAccount extends PlatformError {
    constructor() {
        const message = "NotMarketAccount";
        super(message);
        this.name = message;
    }
}
