import sinon from "sinon"
import { whiteListModule,
  createContract,
  getTierInfo,
  addDeployer,
  getDeployers,
  getDeployedContractAddresses,
  generateSeeds } from "@/whitelist/store/index"

export const whiteListModuleStub = sinon.stub(whiteListModule)
