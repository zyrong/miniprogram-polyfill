import Blob from 'miniprogram-blob'
import File from 'miniprogram-file'

Page({
  onLoad(query) {
    // 页面加载
    const blob = new Blob(['string'])
    blob.text().then((text) => {
      console.log(text)
    })

    const file = new File(['filecontent'], 'filename')
    file.text().then((text) => {
      console.log(text)
    })

    const fd = new FormData()
    fd.append('string', 'string')
    fd.append('file', new File(['filecontent'], 'filename'))

    const IP = '192.168.50.28'
    const PORT = '3333'

    // IDE环境data为arraybuffer会提示无效参数，目前只能真机进行测试。
    my.request({
      url: `http://${IP}:${PORT}/post`,
      method: 'POST',
      data: fd,
      dataType: 'text',
      success(res) {
        console.log(res.data)
      },
    })
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    }
  },
})
