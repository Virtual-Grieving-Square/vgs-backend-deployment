import { WalletModel } from "../model/wallet";

export const addToWallet = async (userId: string, amount: number) => {
  try {
    const wallet = await WalletModel.findOne({ userId });

    if (!wallet) {
      await WalletModel.create({ userId, balance: amount });
    } else {
      wallet.balance += amount;
      await wallet.save();
    }
    return [{ status: true, msg: "success" }];

  } catch (error: any) {
    console.error(error);
    return [false, error.message];
  }
}

export const removeFromWallet = async (userId: string, amount: number) => {
  try {
    const wallet = await WalletModel.findOne({ userId });

    if (!wallet) {
      return [{ status: false, msg: "wallet-not-found" }];
    } else {
      if (wallet.balance < amount) {
        return [{ status: false, msg: "insufficient-funds" }];
      } else {
        wallet.balance -= amount;
        await wallet.save();
        return [{ status: true, msg: "success" }];
      }
    }
  } catch (error: any) {
    console.error(error);
    return [false, error.message];
  }
}