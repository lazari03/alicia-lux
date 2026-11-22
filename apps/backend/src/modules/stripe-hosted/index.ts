import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import StripeHostedProvider from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [StripeHostedProvider],
})
