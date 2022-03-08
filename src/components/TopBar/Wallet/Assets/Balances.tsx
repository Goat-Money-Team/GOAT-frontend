import { AssetCard } from "@olympusdao/component-library";
import { FC } from "react";
import { formatCurrency } from "src/helpers";

import { GetTokenPrice } from "../queries";

interface TokenArray {
  assetValue: number;
  symbol: any;
  balance?: string;
  label?: string;
  timeRemaining?: string;
  underlyingSymbol?: string;
  pnl?: string | number;
  alwaysShow?: boolean;
  ctaOnClick?: () => void;
  ctaText?: string;
}
export interface OHMAssetsProps {
  assets: TokenArray[];
}

/**
 * Component for Displaying Assets
 */
const Balances: FC<OHMAssetsProps> = ({ assets }) => {
  const { data: priceFeed = { usd_24h_change: -0 } } = GetTokenPrice();

  return (
    <>
      {assets
        .filter(asset => Number(asset.balance) > 0 || asset.alwaysShow)
        .map(
          (
            token: TokenArray = {
              label: "",
              symbol: undefined,
              assetValue: 0,
            },
          ) => {
            const extraProps =
              token.ctaText && token.ctaOnClick ? { ctaText: token.ctaText, ctaOnClick: token.ctaOnClick } : {};

            return (
              <AssetCard
                token={token.symbol}
                label={token.label}
                assetValue={formatCurrency(token.assetValue, 2)}
                assetBalance={`${token.balance} ${token.underlyingSymbol ? token.underlyingSymbol : token.symbol}`}
                pnl={
                  token.pnl
                    ? token.pnl
                    : Number(token.balance) > 0
                    ? formatCurrency(
                        Number(token.balance) === 0 ? 0 : Number(token.balance) * priceFeed.usd_24h_change,
                        2,
                      )
                    : ""
                }
                timeRemaining={token.timeRemaining}
                {...extraProps}
              />
            );
          },
        )}
    </>
  );
};

export default Balances;