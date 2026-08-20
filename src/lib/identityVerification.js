/** Whether admin detail includes viewable KYC document URLs. */
export function hasIdentityDocuments(identity) {
  if (!identity) return false
  if (identity.documentsUploaded === false) return false
  return Boolean(identity.idFrontUrl || identity.idBackUrl || identity.selfieUrl)
}
