<template>
<q-modal v-model="isVisible" maximized :content-css="{padding: '50px'}">
    <q-modal-layout>
        <q-toolbar slot="header" color="dark" inverted>
            <q-btn
                 flat
                 round
                 dense
                 @click="isVisible = false"
                 icon="reply"
                 />
            <q-toolbar-title>
                Address details
            </q-toolbar-title>
            <q-btn flat @click="isQRCodeVisible = true" label="Show QR Code" />
            <q-btn class="q-ml-sm" color="primary" @click="copyAddress()" label="Copy address" />
        </q-toolbar>

        <div class="layout-padding">

            <template v-if="address != null">

                <AddressHeader :address="address.address"
                               :header="address.address_index == 0 ? 'Primary address' : 'Sub-address (Index '+address.address_index+')'"
                               :subheader="address.address"
                               :extra="'You have '+(address.used?'used':'not used')+' this address'"
                               />


                <template v-if="address.used">
                    <div class="row justify-between" style="max-width: 768px">

                        <div class="infoBox">
                            <div class="infoBoxContent">
                                <div class="text"><span>Balance</span></div>
                                <div class="value"><span><FormatMask :amount="address.balance" /></span></div>
                            </div>
                        </div>

                        <div class="infoBox">
                            <div class="infoBoxContent">
                                <div class="text"><span>Unlocked balance</span></div>
                                <div class="value"><span><FormatMask :amount="address.unlocked_balance" /></span></div>
                            </div>
                        </div>

                        <div class="infoBox">
                            <div class="infoBoxContent">
                                <div class="text"><span>Number of unspent outputs</span></div>
                                <div class="value"><span>{{ address.num_unspent_outputs }}</span></div>
                            </div>
                        </div>

                    </div>
                </template>
                <template v-else>
                    <div class="row justify-between" style="max-width: 768px">

                        <div class="infoBox">
                            <div class="infoBoxContent">
                                <div class="text"><span>Balance</span></div>
                                <div class="value"><span>N/A</span></div>
                            </div>
                        </div>

                        <div class="infoBox">
                            <div class="infoBoxContent">
                                <div class="text"><span>Unlocked balance</span></div>
                                <div class="value"><span>N/A</span></div>
                            </div>
                        </div>

                        <div class="infoBox">
                            <div class="infoBoxContent">
                                <div class="text"><span>Number of unspent outputs</span></div>
                                <div class="value"><span>N/A</span></div>
                            </div>
                        </div>

                    </div>
                </template>

                <div class="q-mt-sm">

                    <div class="non-selectable">
                        <q-icon name="history" size="24px" />
                        <span class="vertical-middle q-ml-xs">Recent incoming transactions to this address</span>
                    </div>

                    <TxList type="in" :limit="5" :to-incoming-address-index="address.address_index" />

                </div>

            </template>

        </div>

    </q-modal-layout>

    <template v-if="address != null">
        <q-modal v-model="isQRCodeVisible" minimized :content-css="{padding: '25px'}">

            <div class="text-center q-mb-sm">
                <qrcode-vue :value="address.address" size="240" />
            </div>

            <q-btn
                 color="primary"
                 @click="isQRCodeVisible = false"
                 label="Close"
             />
        </q-modal>
    </template>

</q-modal>
</template>

<script>
import { mapState } from "vuex"
const {clipboard} = require("electron")
import AddressHeader from "components/address_header"
import FormatMask from "components/format_mask"
import QrcodeVue from "qrcode.vue";
import TxList from "components/tx_list"
export default {
    name: "AddressDetails",
    computed: mapState({
    }),
    data () {
        return {
            isVisible: false,
            isQRCodeVisible: false,
            address: null
        }
    },
    methods: {
        copyAddress() {
            clipboard.writeText(this.address.address)
            this.$q.notify({
                type: "positive",
                timeout: 1000,
                message: "Address copied to clipboard"
            })
        }
    },
    components: {
        AddressHeader,
        TxList,
        FormatMask,
        QrcodeVue
    }
}
</script>

<style>
</style>
