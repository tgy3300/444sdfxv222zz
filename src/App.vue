<template>
    <a-layout class="layout">
        <a-layout-header>
            <div class="logo" />
            <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
                <a-menu-item key="1">首页</a-menu-item>
                <a-menu-item key="2">数据中心</a-menu-item>
                <a-menu-item key="3">关于我们</a-menu-item>
            </a-menu>
        </a-layout-header>
        <a-layout-content style="padding: 0 50px">
            <a-breadcrumb style="margin: 16px 0">
                <a-breadcrumb-item>首页</a-breadcrumb-item>
                <a-breadcrumb-item>数据加工</a-breadcrumb-item>
            </a-breadcrumb>
            <div :style="{ background: '#fff', padding: '50px', textAlign: 'center' }">

                <a-button :style="`
                            background: ${dataStatus ? '#2da44e' : '#1890ff'}; 
                            border: solid 1px ${dataStatus ? '#2da44e' : '#1890ff'}; 
                            color: #fff
                        `" shape="round" :loading="loading" size="large" @click="uploadFile">
                    <template #icon>
                        <CloudDownloadOutlined v-if="dataStatus" />
                        <CloudUploadOutlined v-else />
                    </template>
                    {{dataStatus ? '处理成功，点击下载' : loading ? '数据处理中，请稍后...' : '上传数据'}}

                    <a-progress type="circle" style="
                            position: absolute;
                            top: -1px;
                            left: -48px;
                        " :stroke-color="{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }" :width="42" v-if="importJd > -1" :percent="importJd" />

                </a-button>


                <input type="file" @change="importFile(this)" id="imFile" style="display: none"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />

            </div>
        </a-layout-content>
        <div style="height: 40px"></div>
    </a-layout>
</template>
<script>
    import {
        defineComponent,
        reactive,
        ref
    } from 'vue';
    import {
        CloudUploadOutlined,
        CloudDownloadOutlined
    } from '@ant-design/icons-vue'
    import * as XLSX from "xlsx"

    import axios from 'axios'

    import {
        export_json_to_excel
    } from "./components/excel/Export2Excel";

    export default defineComponent({
        components: {
            CloudUploadOutlined,
            CloudDownloadOutlined
        },
        setup() {

            const loading = ref(false);
            const dataStatus = ref(false);
            const importJd = ref(-1);
            const newDataObj = reactive([]);

            const rABS = ref(false);

            const uploadFile = () => {
                document.getElementById("imFile").click();
            }

            const saveData = (data, i, success) => {

                let item = data[i]
                let toCount = data.length

                let i_re = ++i

                importJd.value = Math.ceil((100 * i_re) / toCount)
                importJd.value = importJd.value > 100 ? 100 : importJd.value

                let d_key = Object.keys(item)
                d_key.push('天气')

                
                let code = '101110101'

                axios({
                    url: `/data/sk/${code}.html`,
                    method: 'get',
                    baseURL: '/api'
                }).then((res) => {

                    let aaa = {};
                    for(let jj = 0; jj < d_key.length; jj++){
                    
                        if( jj == 0 ){
                            aaa[d_key[jj]] = code;
                        }else{
                            
                            if( jj == 2 ){
                                if (res.data && res.data.weatherinfo && res.data.weatherinfo.cityid == code ) {
                                    aaa[d_key[jj]] = res.data.weatherinfo.temp
                                }
                            }else{
                                aaa[d_key[jj]] = item[d_key[jj]]
                            }

                        }

                    }
                    newDataObj[i] = aaa

                    if (importJd.value == 100) {
                        success && success(newDataObj, d_key);
                    }

                    if (i_re < toCount) {
                        saveData(data, i_re, success)
                    }
                    
                }).catch((error) => {
                    console.log(9585, error)
                })

                // console.log(456, i, item[d_key[0]], importJd.value, toCount, i_re, d_key)
                // let code = '101110101'

                

            }

            const formatJson = (filterVal, tableData) => {
                return tableData.map(v => {
                    return filterVal.map(j => {
                        return v[j]
                    })
                })
            }

            const dcExcel = (re, d_key) => {
                require.ensure([], () => {

                    //表头
                    // const tHeader = [
                    //     "姓名",
                    //     "联系方式",
                    //     "联系方式类型",
                    //     "其他信息",
                    //     "对话网址",
                    //     "来源渠道",
                    //     "获取人",
                    //     "更新时间",
                    //     "创建时间",
                    //     "回访分组",
                    //     "回访次数",
                    //     "回访结果",
                    //     "回访备注",
                    //     "回访人",
                    //     "回访时间",
                    // ];

                    //对应的标签，是data中list的key值
                    const filterVal = [
                        d_key[0],
                        d_key[1],
                        d_key[2]
                    ];

                    let re_d = re;

                    // for (let i = 0; i < re_d.length; i++) {
                    //     re_d[i].url = urlFilter(re_d[i].from_client_info.url);
                    //     re_d[i].uptime = timeFormat("", re_d[i].uptime);
                    //     re_d[i].time = timeFormat("", re_d[i].time);
                    //     re_d[i].cljg = baseConfig.cljgMap[re_d[i].cljg].text;
                    //     re_d[i].cltime_fromat = timeFormat("", re_d[i].cltime);
                    //     re_d[i].clr = _this.getZxsName(re_d[i].clr);
                    //     re_d[i].lxfs_type = re_d[i].lxfs_type == 'dh' ? '电话' : re_d[i].lxfs_type ==
                    //         'wx' ? '微信' : 'QQ';
                    // }

                    const list = re_d;

                    //一个方法 我也不知道干嘛的
                    const data = formatJson(filterVal, list);
                    const table_title = "output";
                    export_json_to_excel(d_key, data, table_title);

                });
            }

            // 处理导入的数据
            const dealFile = (data) => {

                document.getElementById("imFile").value = "";
                if (data.length <= 0) {
                    loading.value = false
                    importJd.value = -1
                } else {
                    saveData(data, 0, (re, d_key) => {

                        dcExcel(re, d_key)

                        loading.value = false
                        importJd.value = -1
                    })
                }
            }

            // 导入excel
            const importFile = () => {
                loading.value = true
                let obj = document.getElementById("imFile");
                if (!obj.files) {
                    loading.value = false
                    importJd.value = -1
                    return
                }
                let f = obj.files[0];
                let reader = new FileReader();

                reader.onload = function (e) {
                    let data = e.target.result
                    let wb
                    if (rABS.value) {
                        wb = XLSX.read(btoa(this.fixdata(data)), {
                            // 手动转化
                            type: "base64",
                        });
                    } else {
                        wb = XLSX.read(data, {
                            type: "binary",
                            cellDates: true,
                        });
                    }
                    let json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])

                    // analyzeData: 解析导入数据
                    dealFile(json);
                }

                if (rABS.value) {
                    reader.readAsArrayBuffer(f); //将文件读取为ArrayBuffer
                } else {
                    reader.readAsBinaryString(f); //将文件读取为二进制字符串
                }
            }

            return {
                loading,
                dataStatus,
                uploadFile,
                importFile,
                importJd,
                selectedKeys: ref(['2']),
            };
        },

    });
</script>
<style>
    .site-layout-content {
        min-height: 280px;
        padding: 24px;
        background: #fff;
    }

    #components-layout-demo-top .logo {
        float: left;
        width: 120px;
        height: 31px;
        margin: 16px 24px 16px 0;
        background: rgba(255, 255, 255, 0.3);
    }

    .ant-row-rtl #components-layout-demo-top .logo {
        float: right;
        margin: 16px 0 16px 24px;
    }

    [data-theme='dark'] .site-layout-content {
        background: #141414;
    }
</style>