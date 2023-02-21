/*
    Pioneer SDK

        A ultra-light bridge to the pioneer platform

              ,    .  ,   .           .
          *  / \_ *  / \_      .-.  *       *   /\'__        *
            /    \  /    \,   ( ₿ )     .    _/  /  \  *'.
       .   /\/\  /\/ :' __ \_   -           _^/  ^/    `--.
          /    \/  \  _/  \-'\      *    /.' ^_   \_   .'\  *
        /\  .-   `. \/     \ /==~=-=~=-=-;.  _/ \ -. `_/   \
       /  `-.__ ^   / .-'.--\ =-=~_=-=~=^/  _ `--./ .-'  `-
      /        `.  / /       `.~-^=-=~=^=.-'      '-._ `._

                             A Product of the CoinMasters Guild
                                              - Highlander

      Api Docs:
        * https://pioneers.dev/docs/
      Transaction Diagram
        * https://github.com/BitHighlander/pioneer/blob/master/docs/pioneerTxs.png

*/
// import { KkRestAdapter } from "@keepkey/hdwallet-keepkey-rest";
// import { KeepKeySdk } from "@keepkey/keepkey-sdk";
// import { SDK } from "@pioneer-sdk/sdk";
// import * as core from "@shapeshiftoss/hdwallet-core";
import { KkRestAdapter } from "@keepkey/hdwallet-keepkey-rest";
import { KeepKeySdk } from "@keepkey/keepkey-sdk";
import { SDK } from "@pioneer-sdk/sdk";
import * as core from "@shapeshiftoss/hdwallet-core";
import {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect,
  // useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
// import { v4 as uuidv4 } from "uuid";

// import { Keyring } from "@shapeshiftoss/hdwallet-core";

export enum WalletActions {
  SET_STATUS = "SET_STATUS",
  SET_USERNAME = "SET_USERNAME",
  SET_USER = "SET_WALLETS",
  // SET_WALLETS = "SET_WALLETS",
  // SET_WALLET_DESCRIPTIONS = "SET_WALLET_DESCRIPTIONS",
  // INIT_PIONEER = "INIT_PIONEER",
  SET_API = "SET_API",
  RESET_STATE = "RESET_STATE",
}

export interface InitialState {
  // keyring: Keyring;
  status: any;
  username: string;
  serviceKey: string;
  queryKey: string;
  context: string;
  // balances: any[];
  // pubkeys: any[];
  // wallets: any[];
  // walletDescriptions: any[];
  // totalValueUsd: number;
  // app: any;
  user: any;
  api: any;
}

const initialState: InitialState = {
  // keyring: new Keyring(),
  status: "disconnected",
  username: "",
  serviceKey: "",
  queryKey: "",
  context: "",
  // balances: [],
  // pubkeys: [],
  // wallets: [],
  // walletDescriptions: [],
  // totalValueUsd: 0,
  // app: {} as any,
  user: null,
  api: null,
};

export interface IPioneerContext {
  state: InitialState;
  username: string | null;
  context: string | null;
  status: string | null;
  // totalValueUsd: number | null;
  // app: any;
  user: any;
  api: any;
}

export type ActionTypes =
  | { type: WalletActions.SET_STATUS; payload: any }
  | { type: WalletActions.SET_USERNAME; payload: string }
  | { type: WalletActions.SET_API; payload: any }
  | { type: WalletActions.SET_USER; payload: any }
  // | { type: WalletActions.SET_WALLET_DESCRIPTIONS; payload: any }
  // | { type: WalletActions.INIT_PIONEER; payload: boolean }
  | { type: WalletActions.RESET_STATE };

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_STATUS:
      return { ...state, status: action.payload };
    case WalletActions.SET_USERNAME:
      return { ...state, username: action.payload };
    case WalletActions.SET_API:
      return { ...state, api: action.payload };
    case WalletActions.SET_USER:
      return { ...state, user: action.payload };
    case WalletActions.RESET_STATE:
      return {
        ...state,
        api: null,
        user: null,
        username: null,
        context: null,
        status: null,
      };
    default:
      return state;
  }
};

const PioneerContext = createContext(initialState);

export const PioneerProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [username, setUsername] = useState<string | null>(null);
  // const [context, setContext] = useState<string | null>(null);

  const onStart = async function () {
    try {
      // eslint-disable-next-line no-console
      console.log("onStart***** ");
      const serviceKey: string | null = localStorage.getItem("serviceKey"); // KeepKey api key
      let queryKey: string | null = localStorage.getItem("queryKey");
      let username: string | null = localStorage.getItem("username");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dispatch({ type: WalletActions.SET_USERNAME, payload: username });
      // eslint-disable-next-line no-console
      console.log("username: ", username);

      //
      const config: any = {
        apiKey: serviceKey || "notSet",
        pairingInfo: {
          name: "ShapeShift",
          imageUrl: "https://assets.coincap.io/assets/icons/fox@2x.png",
          basePath: "http://localhost:1646/spec/swagger.json",
          url: "https://pioneer-template.vercel.com",
        },
      };
      const sdk = await KeepKeySdk.create(config);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!config.apiKey !== serviceKey) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        localStorage.setItem("serviceKey", config.apiKey);
      }
      const keyring = new core.Keyring();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const walletInit = await KkRestAdapter.useKeyring(keyring).pairDevice(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sdk
      );
      if (!queryKey) {
        queryKey = `key:${uuidv4()}`;
        localStorage.setItem("queryKey", queryKey);
      }
      if (!username) {
        username = `user:${uuidv4()}`;
        username = username.substring(0, 13);
        localStorage.setItem("username", username);
      }

      const blockchains = [
        "bitcoin",
        "ethereum",
        "thorchain",
        "bitcoincash",
        "litecoin",
        "binance",
        "cosmos",
        "dogecoin",
      ];

      // add custom path
      const paths: any = [];
      // const spec = "https://pioneers.dev/spec/swagger.json";
      // const wss = "wss://pioneers.dev";
      const spec = "http://127.0.0.1:9001/spec/swagger.json";
      const wss = "ws://127.0.0.1:9001";
      const configPioneer: any = {
        blockchains,
        username,
        queryKey,
        spec,
        wss,
        paths,
      };
      const appInit = new SDK(spec, configPioneer);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const api = await appInit.init(walletInit);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dispatch({ type: WalletActions.SET_API, payload: api });
      const user = await api.User();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dispatch({ type: WalletActions.SET_USER, payload: user.data });
      // setUsername(localStorage.getItem("username"));
      // eslint-disable-next-line no-console

      // eslint-disable-next-line no-console
      console.log("user: ", user);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  // onstart get data
  useEffect(() => {
    onStart();
  }, []);

  // end
  const value: any = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <PioneerContext.Provider value={value}>{children}</PioneerContext.Provider>
  );
};

export const usePioneer = (): any =>
  useContext(PioneerContext as unknown as React.Context<IPioneerContext>);
