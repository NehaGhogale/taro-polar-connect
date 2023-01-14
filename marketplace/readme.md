tarod --network=regtest --debuglevel=debug --lnd.macaroonpath=/home/nehaparab/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon --lnd.tlspath=/home/nehaparab/.polar/networks/1/volumes/lnd/alice/tls.cert --tarodir=~/taro/.taro-alice --rpclisten=0.0.0.0:10029 --lnd.host=127.0.0.1:10001 --restlisten=0.0.0.0:8089

tarod --network=regtest --debuglevel=debug --lnd.macaroonpath=/home/nehaparab/.polar/networks/1/volumes/lnd/bob/data/chain/bitcoin/regtest/admin.macaroon --lnd.tlspath=/home/nehaparab/.polar/networks/1/volumes/lnd/bob/tls.cert --tarodir=~/taro/.taro-bob --rpclisten=0.0.0.0:10030 --lnd.host=127.0.0.1:10002 --restlisten=0.0.0.0:8090

tarod --network=regtest --debuglevel=debug --lnd.macaroonpath=/home/nehaparab/.polar/networks/1/volumes/lnd/carol/data/chain/bitcoin/regtest/admin.macaroon --lnd.tlspath=/home/nehaparab/.polar/networks/1/volumes/lnd/carol/tls.cert --tarodir=~/taro/.taro-carol --rpclisten=0.0.0.0:10031 --lnd.host=127.0.0.1:10003 --restlisten=0.0.0.0:8091


tarocli-bob -n regtest assets mint --skip_batch=true --type normal --name beefbux6 --supply 1000 --meta "fantastic money"

tarocli-bob -n regtest assets list


tarocli-alice -n regtest addrs new --genesis_bootstrap_info 41d7e6fd2b5752cec428f5508f2d09fb01ce9a30fd099ad1ddc12dc3ffc2354f000000000862656566627578360f66616e746173746963206d6f6e65790000000000 --amt 100

tarocli-alice -n regtest assets send --addr tarort1qqqsqq368qu5cj0d703ucl8w3sr36r8gsls78588wrzmsehwuk8kw7d5tk6qqqqqqqzxuetgvy9hkgnpygazyernwv386qqqqqqqzpppq2mlza7alffadrzun47plp3q9utqlqhwtfuvjl3e2k237zlkv7um2p3pqtxm5dq4rw6j8c49clk8mjp9z9lqp2hn0kmdrc2ddv0a3yuv36vcuzqpqye95dur\

tarocli-bob -n regtest proofs export -asset_id 26f2394d17c78c5cd4a00b3ccb641a22651aa97e9068a84eff96217b5d587567 -script_key 02c30418ad0dfecb67d31d0badcdbd254c3d705b37cbaea01087ce33699d9dd7e7

tarocli-alice -n regtest proofs export -asset_id e85fac58cbc8c61860651b6e75f335e407c0c13c5cfe055fa42cb2f9d5e121c1 -script_key 02b7f177ddfa53d68c5c9d7c1f86202f160f82ee5a78c97e3955951f0bf667b9b5

tarocli-bob -n regtest proofs import -proof_file /home/nehaparab/taro/.taro-alice/data/regtest/proofs/e85fac58cbc8c61860651b6e75f335e407c0c13c5cfe055fa42cb2f9d5e121c1/02b7f177ddfa53d68c5c9d7c1f86202f160f82ee5a78c97e3955951f0bf667b9b5.taro


tarocli-alice -n regtest proofs import -proof_file  02c30418ad0dfecb67d31d0badcdbd254c3d705b37cbaea01087ce33699d9dd7e7.taro
tarocli-alice -n regtest assets transfers

tarocli-alice -n regtest assets list