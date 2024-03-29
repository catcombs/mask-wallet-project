<template>
<div>

    <template v-if="tx_list.length === 0">

        <p class="q-pa-md q-mb-none">No transactions found</p>

    </template>
    <template v-else>
        <q-infinite-scroll :handler="loadMore" ref="scroller">
            <q-list link no-border class="tx-list">
                <q-item v-for="(tx, index) in tx_list" :key="tx.txid"
                        @click.native="details(tx)" :class="'tx-'+tx.type">
                    <q-item-side>
                        <TxTypeIcon :type="tx.type" />
                    </q-item-side>
                    <q-item-main>
                        <q-item-tile class="monospace ellipsis" label>{{ tx.txid }}</q-item-tile>
                        <q-item-tile sublabel>{{ formatHeight(tx.height) }}</q-item-tile>
                    </q-item-main>
                    <q-item-side>
                        <q-item-tile label>
                            <FormatMask :amount="tx.amount" />
                        </q-item-tile>
                        <q-item-tile sublabel>
                            <timeago :datetime="tx.timestamp*1000" :auto-update="60">
                            </timeago>
                        </q-item-tile>
                    </q-item-side>
                </q-item>
                <q-spinner-dots slot="message" :size="40"></q-spinner-dots>
            </q-list>
        </q-infinite-scroll>
    </template>

    <TxDetails ref="txDetails" />

</div>
</template>

<script>
import { mapState } from "vuex"
import { QSpinnerDots } from "quasar"
import Identicon from "components/identicon"
import TxTypeIcon from "components/tx_type_icon"
import TxDetails from "components/tx_details"
import FormatMask from "components/format_mask"
export default {
    name: "TxList",
    data () {
        return {
            page: 0
        }
    },
    props: {
        limit: {
            type: Number,
            required: false,
            default: -1
        },
        type: {
            type: String,
            required: false,
            default: "all"
        },
        toOutgoingAddress: {
            type: String,
            required: false,
            default: ""
        },
        toIncomingAddressIndex: {
            type: Number,
            required: false,
            default: -1
        },
    },
    computed: mapState({
        current_height: state => state.gateway.daemon.info.height,
        tx_list_all: state => state.gateway.wallet.transactions.tx_list,
        tx_list (state) {
            let tx_list_filter = this.tx_list_all.filter((tx) => {
                let valid = true
                if(this.type !== "all" && this.type !== tx.type)
                    valid = false

                if(this.toOutgoingAddress !== "") {
                    if(tx.hasOwnProperty("destinations")) {
                        valid = tx.destinations.filter((destination) => { return destination.address === this.toOutgoingAddress }).length;
                    } else {
                        valid = false
                    }
                }

                if(this.toIncomingAddressIndex !== -1) {
                    valid = tx.hasOwnProperty("subaddr_index") && tx.subaddr_index.minor == this.toIncomingAddressIndex
                }

                return valid
            })

            if(this.limit !== -1) {
                tx_list_filter = tx_list_filter.slice(0, this.limit)
            } else {
                tx_list_filter = tx_list_filter.slice(0, this.page * 24 + 24)
            }

            return tx_list_filter
        },
    }),
    methods: {
        details (tx) {
            this.$refs.txDetails.tx = tx;
            this.$refs.txDetails.txNotes = tx.note;
            this.$refs.txDetails.isVisible = true;
        },
        formatHeight(height) {
            let confirms = this.current_height - height;
            if(height == 0)
                return "Pending"
            if(confirms < 10)
                return `Height: ${height} (${confirms} confirm${confirms==1?'':'s'})`
            else
                return `Height: ${height} (confirmed)`
        },
        loadMore: function(index, done) {
            this.page = index
            if(this.limit !== -1 || this.tx_list.length < this.page * 24 + 24)
                this.$refs.scroller.stop()
            done()
        }
    },
    watch: {
        type: {
            handler(val, old){
                if(val == old) return
                if(this.$refs.scroller) {
                    this.$refs.scroller.stop()
                    this.page = 0
                    this.$refs.scroller.reset()
                    this.$refs.scroller.resume()
                }
            }
        }
    },
    components: {
        QSpinnerDots,
        Identicon,
        TxTypeIcon,
        TxDetails,
        FormatMask
    }
}
</script>

<style lang="scss">
.tx-list {

    .q-item.tx-in,
    .q-item.tx-pool {
        .q-icon {
            color: #333;
        }
        .q-item-label {
            color: green;
        }
        &>div:last-child {
            text-align:right;
            &>div:first-child {
                span {
                    color: green;
                    &:before {
                        content: "+";
                        color: green;
                    }
                }
            }
        }
    }

    .q-item.tx-out,
    .q-item.tx-pending {
        .q-icon {
            color: #333;
        }
        .q-item-label {
            color: purple;
        }
        &>div:last-child {
            text-align:right;
            &>div:first-child {
                span {
                    color: purple;
                    &:before {
                        content: "-";
                        color: purple;
                    }
                }
            }
        }
    }
}
</style>
