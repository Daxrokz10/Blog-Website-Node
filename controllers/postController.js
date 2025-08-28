const Post = require('../models/Post');

exports.feed = async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username')
    .sort({ createdAt: -1 });
  res.render('./pages/blog/blogHome', { posts });
};

exports.createForm = (req, res) => {
  res.render('./pages/writer/writerHome'); // contains the create-post form
};

exports.create = async (req, res) => {
  try {
    const { title, body } = req.body;
    const post = new Post({
      title,
      body,
      author: req.session.userId
    });
    if (req.file) {
      post.coverUrl = req.file.path;        // cloudinary url
      post.coverPublicId = req.file.filename; // public id
    }
    await post.save();
    res.redirect('/blog');
  } catch (e) {
    console.log(e);
    res.status(500).send('Error creating post');
  }
};

exports.show = async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username')
    .populate('comments.author', 'username');
  if (!post) return res.redirect('/blog');
  res.render('./pages/blog/post', { post, me: req.session.userId });
};

exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/blog');
  const uid = req.session.userId.toString();
  const i = post.likes.findIndex(x => x.toString() === uid);
  if (i >= 0) post.likes.splice(i, 1);
  else post.likes.push(uid);
  await post.save();
  res.redirect('/posts/' + post._id);
};

exports.addComment = async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.redirect('/posts/' + req.params.id);
  await Post.findByIdAndUpdate(req.params.id, {
    $push: { comments: { author: req.session.userId, body } }
  });
  res.redirect('/posts/' + req.params.id);
};
