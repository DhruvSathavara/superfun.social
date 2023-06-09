

import { toast } from 'react-toastify';
import { pollUntilIndexed } from '../../indexer/has-transaction-been-indexed';
import { getAddress, signedTypeData, splitSignature } from '../../services/ethers-service';
import { lensHub } from '../../services/lens-hub';
import { createMirrorTypedData, mirror } from './create-mirror-typed-data';
import { BigNumber, utils } from 'ethers';

export const createMirror = async (data) => {
  const profileId = data.profileId;
  if (!profileId) {
    toast.error('Please login first!');
    return;
  }

  try {
    await data.login(data.address);

    const createMirrorRequest = {
      profileId,
      publicationId: data.publishId,
      referenceModule: {
        followerOnlyReferenceModule: false,
      },
    };

    const result = await createMirrorTypedData(createMirrorRequest);
    const typedData = result.data.createMirrorTypedData.typedData;
    const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);

    const { v, r, s } = splitSignature(signature);

    const tx = await lensHub.mirrorWithSig({
      profileId: typedData.value.profileId,
      profileIdPointed: typedData.value.profileIdPointed,
      pubIdPointed: typedData.value.pubIdPointed,
      referenceModuleData: typedData.value.referenceModuleData,
      referenceModule: typedData.value.referenceModule,
      referenceModuleInitData: typedData.value.referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    });
    const indexedResult = await pollUntilIndexed(tx.hash);
    const logs = indexedResult.txReceipt.logs;
    const topicId = utils.id(
      'MirrorCreated(uint256,uint256,uint256,uint256,bytes,address,bytes,uint256)'
    );

    const profileCreatedLog = logs.find((l) => l.topics[0] === topicId);
    let profileCreatedEventLog = profileCreatedLog.topics;
    const publicationId = utils.defaultAbiCoder.decode(['uint256'], profileCreatedEventLog[2])[0];
    toast.success('Post has been mirrored!');

    return result.data;
  } catch (error) {
    toast.error(error);
  }
};


export const createMirrorByDis = async (postData) => {
  const profileId = window.localStorage.getItem("profileId");
  // hard coded to make the code example clear
  if (!profileId) {
    toast.error('Please login first!');
    return;
  }

  const address = await getAddress();

  await postData.login(address);

  // hard coded to make the code example clear
  const createMirrorRequest = {
    profileId,
    // remember it has to be indexed and follow metadata standards to be traceable!
    publicationId: postData.publishId,
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  };

  const result = await mirror(createMirrorRequest);
  const indexedResult = await pollUntilIndexed(result?.data?.createMirrorViaDispatcher.txHash);
  return result;
};