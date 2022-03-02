import axios from "axios";
import { gql, request } from "graphql-request";
import { useQuery } from "react-query";
const snapshotUrl = "https://hub.snapshot.org/graphql";
const mediumUrl = "https://api.rss2json.com/v1/api.json?rss_url=https://olympusdao.medium.com/feed";
import { FUSE_POOL_18_ADDRESSES, SOHM_ADDRESSES, V1_SOHM_ADDRESSES } from "src/constants/addresses";
import { EnvHelper } from "src/helpers/Environment";
import { useWeb3Context } from "src/hooks";
import { useStaticFuseContract } from "src/hooks/useContract";
import { NetworkId } from "src/networkDetails";
export const ActiveProposals = () => {
  const { data, isFetched, isLoading } = useQuery("ActiveProposals", async () => {
    const data = await request(
      snapshotUrl,
      gql`
        query Proposals {
          proposals(
            first: 20
            skip: 0
            where: { space_in: ["olympusdao.eth"] }
            orderBy: "created"
            orderDirection: desc
          ) {
            id
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            link
            scores
          }
        }
      `,
    );
    return data;
  });
  return { data, isFetched, isLoading };
};

export const MediumArticles = () => {
  const { data, isFetched, isLoading } = useQuery("MediumArticles", async () => {
    return await axios.get(mediumUrl).then(res => {
      return res.data;
    });
  });
  return { data, isFetched, isLoading };
};

export const SupplyRatePerBlock = () => {
  const fuse = useStaticFuseContract(FUSE_POOL_18_ADDRESSES[NetworkId.MAINNET], NetworkId.MAINNET);
  const { data, isFetched, isLoading } = useQuery("FuseSupply", async () => {
    return await fuse.supplyRatePerBlock();
  });
  return { data, isFetched, isLoading };
};

export const GetTokenPrice = (tokenId = "olympus") => {
  const { data, isFetched, isLoading } = useQuery(["TokenPrice", tokenId], async () => {
    const cgResp = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`,
    );
    return cgResp.data[tokenId];
  });
  return { data, isFetched, isLoading };
};

export const GetTransactionHistory = () => {
  const { address, networkId } = useWeb3Context();
  const reqObject = JSON.stringify({
    jsonrpc: "2.0",
    id: 0,
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromBlock: "0x98EBFE",
        fromAddress: address.toString(),
        contractAddresses: [
          SOHM_ADDRESSES[networkId as keyof typeof SOHM_ADDRESSES],
          V1_SOHM_ADDRESSES[networkId as keyof typeof V1_SOHM_ADDRESSES],
        ],
        // maxCount: "0x5",
        excludeZeroValue: true,
        category: ["erc20", "token"],
      },
    ],
  });
  const alchemyEndpoint = EnvHelper.getAlchemyAPIKeyList(networkId);
  const { data, isFetched, isLoading } = useQuery(
    ["TransactionHistory", networkId],
    async () => {
      if (alchemyEndpoint.length > 0) {
        const resp = await axios.post(alchemyEndpoint[0], reqObject);
        return resp.data.result;
      }
    },
    { enabled: !!address && !!networkId },
  );
  return { data, isFetched, isLoading };
};
