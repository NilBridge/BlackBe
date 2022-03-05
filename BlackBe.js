const axios = require('axios')
const url = "https://api.blackbe.xyz/openapi/v3"


//请在此配置在云黑获取的token，否则某些功能不可用
const token = ""


// 拦截器
axios.interceptors.request.use(
    config => {
        config.headers.Authorization = "Bearer " + token
        return config
    }
)

function checkList(e) {
    axios.get(url + '/private/repositories/list')
        .then(function (res) {
            let str = ''
            res.data.data.repositories_list.forEach(i => {
                str += '\nuuid：' + i.uuid + '\n库名：' + i.name + '\n数目：' + i.list_num + '\n服务器类型：' + i.server_type
            });
            e.reply(str);
        })
        .catch(function (error) {
            // 处理错误情况
            console.log(error);
            e.reply(error + '：' + error.data.message);
        })
}

function checkPl(e) {
    let qq = NIL.TOOL.getAt(e)

    if (qq != null && qq != '') {
        axios.get(url + '/check?qq=' + qq)
            .then(res => {
                let str = ''
                e.reply(res.data.message)
                if (res.data.data.exist == true) {
                    res.data.data.info.forEach(i => {
                        str += '\nID：' + i.name + '\n违规信息：' + i.info + '\n证据：' + JSON.stringify(i.photos)
                    });
                    e.reply(str);
                }
            }).catch(function (error) {
                // 处理错误情况
                console.log(error);
                e.reply(error + '：' + error.data.message);
            })
        return
    }
    e.reply("目前仅支持@查询，我好懒啊不想写了");
}

function checkPieceList(e) {
    let uuid = e.raw_message.split("库条目")[1]
    if(uuid != null && uuid != ''){
        axios.get(url + '/private/repositories/piece/list?uuid=' + uuid)
            .then(res => {
                let str = ''
                e.reply(res.data.message)
                if (res.data.status === 2000) {
                    res.data.data.piece_list.forEach(i => {
                        str += '=-------------=\n'
                        str += '玩家名字：' + i.name + '\n违规信息：' + i.info + '\n作案时间：' + i.time + '\n玩家QQ：' + i.qq + '\n玩家手机号：' + i.phone + '\n'
                        str += '=-------------=\n'
                    });
                    e.reply(str);
                }
            }).catch(function (error) {
                // 处理错误情况
                console.log(error);
                e.reply(error + '：' + error.data.message);
            })
        return
    }
}


function main(e) {
    if (e.group_id != NIL.CONFIG.GROUP_MAIN) return;
    switch (e.raw_message) {
        case "云黑库列表":
            checkList(e)
            break;
        case (e.raw_message.match(/库条目/) || {}).input:
            checkPieceList(e)
            break;
        case (e.raw_message.match(/查云黑/) || {}).input:
            checkPl(e)
            break;
        default:
            break;
    }
}


function onStart() {
    NIL.FUNC.PLUGINS.GROUP.push(main);
    NIL.Logger.info('BlackBe', '爷被加载辣');
}

function onStop() {
    NIL.Logger.info('BlackBe', '爷被卸载辣');
}

module.exports = {
    onStart,
    onStop
}