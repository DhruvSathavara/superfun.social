import { apolloClient } from '../services/ApolloClient'; 
import { gql } from '@apollo/client'
import { getAddressFromSigner } from '../services/ethers-service'; 
import { BigNumber, utils } from "ethers"; 
import { pollUntilIndexed } from '../indexer/has-transaction-been-indexed';
import { toast } from 'react-toastify';

const CREATE_PROFILE = `
  mutation($request: CreateProfileRequest!) { 
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
            __typename
    }
 }
`

export const createProfileRequest = (createProfileRequest) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_PROFILE),
    variables: {
      request: createProfileRequest
    },
  })
}


const createProfile = async (handleInput) => { 
  try {
    if (!handleInput) {
      throw new Error("handleInput is undefined");
    }
    getAddressFromSigner();

    await handleInput.login(handleInput.address);

    const createProfileResult = await createProfileRequest({
      handle: handleInput.handle,
      profilePictureUri: handleInput.url,
      followModule: {
        freeFollowModule: true
      }
    });



    if (createProfileResult?.data.createProfile.__typename === "RelayError") {
      alert(`Error when creating a profile: ${createProfileResult?.data.createProfile.reason}`);
      return false;
    }
 
    const result = await pollUntilIndexed(createProfileResult.data.createProfile.txHash) 

    const logs = result.txReceipt.logs;

    const topicId = utils.id(
      "ProfileCreated(uint256,address,address,string,string,address,bytes,string,uint256)"
    );
      
    const profileCreatedLog = logs.find((l) => l.topics[0] === topicId);

    let profileCreatedEventLog = profileCreatedLog.topics;

    const profileId = utils.defaultAbiCoder.decode(["uint256"], profileCreatedEventLog[1])[0]; 

    window.localStorage.setItem("profileId", BigNumber.from(profileId).toHexString());

    return result;
  } catch (error) {
    toast.error(error);
  }
};

export default createProfile;


