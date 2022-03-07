const axios = require('axios')
const baseURL = "https://api.blackbe.xyz/openapi/v3"


//请在此配置在云黑获取的token，否则某些功能不可用
const token = ""


// 拦截器
axios.interceptors.request.use(
    config => {
        config.url = baseURL + config.url
        config.headers.Authorization = "Bearer " + token
        return config
    }
)

function checkList(e) {
    axios.get('/private/repositories/list')
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
        axios.get('/check?qq=' + qq)
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
    if (uuid != null && uuid != '') {
        axios.get('/private/repositories/piece/list?uuid=' + uuid)
            .then(res => {
                let str = ''
                e.reply(res.data.message)
                if (res.data.status === 2000) {
                    res.data.data.piece_list.forEach(i => {
                        str += '=-------------=\n'
                        str += '玩家uuid：' + i.uuid + '\n玩家名字：' + i.name + '\n违规信息：' + i.info + '\n作案时间：' + i.time + '\n玩家QQ：' + i.qq + '\n玩家手机号：' + i.phone + '\n'
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


function uploadPiece(args) {
    let data = {}
    // let data = { "server": args[0], "name": args[1], "info": args[2], "black_id": args[3] }
    switch (args.length) {
        case 3:
            data.server = args[0]
            data.name = args[1]
            data.black_id = args[2]
            break;
        case 4:
            data.server = args[0]
            data.name = args[1]
            data.info = args[2]
            data.black_id = args[3]
            break;
        default:
            return "参数不足喔，输入多点参数，或者看看文档吧";
    }
    axios({
        method: 'post',
        url: '/private/repositories/piece/upload',
        headers: {
            "Content-Type": "application/json"
        },
        data: data
    }).then(function (res) {
        return res.data.message
    }).catch(function (error) {
        return error.response.data.message
    })
    // }).then(res => {
    //     return res.data.message
    // }).catch(error => {
    //     return error.response.data.message
    // })
    return "可能成功也可能没成功，但只要你输入参数正确那应该没问题，至于为什么等作者改2.0"
}

function deletePiece(args) {
    let data = { "piece_uuid": args[0] }

    axios({
        method: 'post',
        url: '/private/repositories/piece/delete',
        headers: {
            "Content-Type": "application/json"
        },
        data: data
    }).then(function (res) {
        return res.data.message
    }).catch(function (error) {
        return error.response.data.message
    })

    return "可能成功也可能没成功，但只要你输入参数正确那应该没问题，至于为什么等作者改2.0"
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

    NIL.NBCMD.regUserCmd("upload", uploadPiece);
    NIL.NBCMD.regUserCmd("delete", deletePiece);
    NIL.Logger.info('BlackBe', '爷被加载辣');
}

function onStop() {
    NIL.NBCMD.remUserCmd("upload");
    NIL.NBCMD.remUserCmd("delete");
    NIL.Logger.info('BlackBe', '爷被卸载辣');
}

module.exports = {
    onStart,
    onStop
}