<template>
<q-page>

    <div class="row q-pt-sm q-mx-md q-mb-none items-center non-selectable" style="height: 44px;">

        <div class="col-8">
            <q-icon name="call_made" size="24px" /> Send Mask
        </div>

        <div class="col-4">
        </div>

    </div>

    <div class="q-pa-md">


        <div class="row items-end gutter-md">

            <div class="col">
                <q-field class="q-ma-none">
                    <q-input v-model="newTx.amount" float-label="Amount"
                             type="number" min="0" :max="unlocked_balance / 1e12" />
                </q-field>
            </div>

            <div>
                <q-btn @click="newTx.amount = unlocked_balance / 1e12">All coins</q-btn>
            </div>

        </div>

        <q-item class="q-pa-none">
            <q-item-side>
                <Identicon :address="newTx.address" />
            </q-item-side>
            <q-item-main>
                <q-field>
                    <q-input v-model="newTx.address" float-label="Address"
                             @blur="$v.newTx.address.$touch"
                             :error="$v.newTx.address.$error"
                             />
                </q-field>
            </q-item-main>
        </q-item>

        <q-field style="margin-top:0">
            <q-input v-model="newTx.payment_id" float-label="Payment ID (optional)"
                     @blur="$v.newTx.payment_id.$touch"
                     :error="$v.newTx.payment_id.$error"
                     />
        </q-field>

        <div class="row gutter-md">

            <div class="col-6">
                <q-field>
                    <q-select
                         v-model="newTx.mixin"
                         float-label="Mixin"
                         :options="mixinOptions"
                         />
                </q-field>
            </div>
            <div class="col-6">
                <q-field>
                    <q-select
                         v-model="newTx.priority"
                         float-label="Priority"
                         :options="priorityOptions"
                         />
                </q-field>
            </div>

        </div>


        <q-field>
            <q-checkbox v-model="newTx.address_book.save" label="Save to address book" />
        </q-field>

        <div v-if="newTx.address_book.save">
            <q-field>
                <q-input v-model="newTx.address_book.name" float-label="Name" />
            </q-field>
            <q-field>
                <q-input v-model="newTx.address_book.description" type="textarea" rows="2" float-label="Notes" />
            </q-field>
        </div>

        <q-field class="q-pt-sm">
            <q-btn
                 :disable="!is_ready"
                 color="primary" @click="send()" label="Send" />
        </q-field>

    </div>

    <q-inner-loading :visible="tx_status.sending">
        <q-spinner color="primary" :size="30" />
    </q-inner-loading>

</q-page>
</template>

<script>
import { mapState } from "vuex"
import { required, decimal } from "vuelidate/lib/validators"
import { payment_id, address } from "src/validators/common"
import Identicon from "components/identicon"
const objectAssignDeep = require("object-assign-deep");
export default {
    computed: mapState({
        unlocked_balance: state => state.gateway.wallet.info.unlocked_balance,
        tx_status: state => state.gateway.tx_status,
        is_ready (state) {
            return this.$store.getters["gateway/isReady"]
        }
    }),
    data () {
        return {
            sending: false,
            newTx: {
                amount: 0,
                address: "",
                payment_id: "",
                mixin: 60,
                priority: 0,
                address_book: {
                    save: false,
                    name: "",
                    description: ""
                }
            },
            mixinOptions: [
                {label: "60 mixins (super privacy)", value: 60}
            ],
            priorityOptions: [
                {label: "Normal (x1 fee)", value: 0},
                {label: "High (x2 fee)", value: 1},
                {label: "High (x4 fee)", value: 2},
                {label: "High (x20 fee)", value: 3},
                {label: "Highest (x144 fee)", value: 4},
            ],
        }
    },
    validations: {
        newTx: {
            amount: {
                required,
                decimal
            },
            address: { required, address },
            payment_id: { payment_id }
        }
    },
    watch: {
        tx_status: {
            handler(val, old){
                if(val.code == old.code) return
                switch(this.tx_status.code) {
                    case 0:
                        this.$q.notify({
                            type: "positive",
                            timeout: 1000,
                            message: this.tx_status.message
                        })
                        this.$v.$reset();
                        this.newTx = {
                            amount: 0,
                            address: "",
                            payment_id: "",
                            mixin: 60,
                            priority: 0,
                            address_book: {
                                save: false,
                                name: "",
                                description: ""
                            }
                        }
                        break;
                    case -1:
                        this.$q.notify({
                            type: "negative",
                            timeout: 1000,
                            message: this.tx_status.message
                        })
                        break;
                }
            },
            deep: true
        }
    },
    methods: {
        send: function () {

            this.$v.newTx.$touch()

            if(this.newTx.amount < 0) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Amount cannot be negative"
                })
                return
            } else if(this.newTx.amount == 0) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Amount must be greater than zero"
                })
                return
            } else if(this.newTx.amount > this.unlocked_balance / 1e12) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Not enough unlocked balance"
                })
                return
            } else if (this.$v.newTx.amount.$error) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Amount not valid"
                })
                return
            }


            if (this.$v.newTx.address.$error) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Address not valid"
                })
                return
            }

            if (this.$v.newTx.payment_id.$error) {
                this.$q.notify({
                    type: "negative",
                    timeout: 1000,
                    message: "Payment id not valid"
                })
                return
            }

            this.$q.dialog({
                title: "Transfer",
                message: "Enter wallet password to continue.",
                prompt: {
                    model: "",
                    type: "password"
                },
                ok: {
                    label: "SEND"
                },
                cancel: {
                    flat: true,
                    label: "CANCEL"
                }
            }).then(password => {
                this.$store.commit("gateway/set_tx_status", {
                    code: 1,
                    message: "Sending transaction",
                    sending: true
                })
                let newTx = objectAssignDeep.noMutate(this.newTx, {password})
                this.$gateway.send("wallet", "transfer", newTx)
            })
        }
    },
    components: {
        Identicon
    }
}
</script>

<style>
</style>
