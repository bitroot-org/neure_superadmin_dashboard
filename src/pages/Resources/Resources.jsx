import React, { useState, useEffect } from "react";
import {
  Tabs,
  Button,
  Table,
  Space,
  DatePicker,
  Drawer,
  Form,
  Input,
  Upload,
  Select,
  message,
  Modal,
} from "antd";
import {
  FilterOutlined,
  PlusOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import styles from "./Resources.module.css";
import {
  getArticles,
  getGalleryItems,
  uploadGalleryItem,
  updateGalleryItem,
  uploadMediaFile,
  createArticle,
  deleteArticle,
  deleteGalleryItem,
} from "../../services/api";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("articles");
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editForm] = Form.useForm();

  // Add new state variables for articles data and loading
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [imagesPagination, setImagesPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [videosPagination, setVideosPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [documentsPagination, setDocumentsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch articles on component mount
  useEffect(() => {
    if (activeTab === "articles") {
      fetchArticles();
    } else if (activeTab === "images") {
      fetchGalleryItems("image");
    } else if (activeTab === "videos") {
      fetchGalleryItems("video");
    } else if (activeTab === "documents") {
      fetchGalleryItems("document");
    }
  }, [activeTab]);

  // Function to fetch articles
  const fetchArticles = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getArticles({ page, limit });
      if (response.status && response.data) {
        setArticles(response.data.articles || []);
        setPagination({
          current: response.data.pagination.currentPage,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      message.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryItems = async (type, page = 1, limit = 10) => {
    let setLoadingFunc, setDataFunc, setPaginationFunc;

    switch (type) {
      case "image":
        setLoadingFunc = setImagesLoading;
        setDataFunc = setImages;
        setPaginationFunc = setImagesPagination;
        break;
      case "video":
        setLoadingFunc = setVideosLoading;
        setDataFunc = setVideos;
        setPaginationFunc = setVideosPagination;
        break;
      case "document":
        setLoadingFunc = setDocumentsLoading;
        setDataFunc = setDocuments;
        setPaginationFunc = setDocumentsPagination;
        break;
      default:
        return;
    }

    setLoadingFunc(true);
    try {
      const response = await getGalleryItems({ type, page, limit });
      if (response.status && response.data) {
        setDataFunc(response.data.items || []);
        setPaginationFunc({
          current: response.data.pagination.currentPage,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${type} items:`, error);
      message.error(`Failed to load ${type} items`);
    } finally {
      setLoadingFunc(false);
    }
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    // Prefill the edit form with article data
    editForm.setFieldsValue({
      title: article.title,
      read_time: article.reading_time,
      category: article.category,
      tags: article.tags,
      content: article.content,
    });
    setEditDrawerVisible(true);
  };

  const handleUpdateArticle = async (values) => {
    try {
      // Call your API to update the article
      // const response = await updateArticle({ id: selectedArticle.id, ...values });

      message.success("Article updated successfully");
      setEditDrawerVisible(false);
      fetchArticles(pagination.current, pagination.pageSize); // Refresh the list
    } catch (error) {
      console.error("Error updating article:", error);
      message.error("Failed to update article");
    }
  };

  const handleDeleteArticle = (articleId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this article?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await deleteArticle(articleId);
          if (response.status) {
            message.success("Article deleted successfully");
            setViewDrawerVisible(false);
            fetchArticles(pagination.current, pagination.pageSize);
          }
        } catch (error) {
          console.error("Error deleting article:", error);
          message.error("Failed to delete article");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchArticles(newPagination.current, newPagination.pageSize);
  };

  const handleViewArticle = (article) => {
    setSelectedArticle(article);
    setViewDrawerVisible(true);
  };

  const handleGalleryTableChange = (newPagination, type) => {
    fetchGalleryItems(type, newPagination.current, newPagination.pageSize);
  };

  const extractYoutubeThumbnail = (url) => {
    if (!url) return null;
    
    let videoId = '';
    // Handle different YouTube URL formats
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split(/[?&#]/)[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split(/[?&#]/)[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split(/[?&#]/)[0];
    } else if (url.includes('youtube.com/v/')) {
      videoId = url.split('v/')[1].split(/[?&#]/)[0];
    }
  
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  // Update the articlesColumns to use the actual data
  const articlesColumns = [
    {
      title: "Image",
      key: "coverImage",
      render: (_, record) => (
        <div className={styles.coverImage}>
          <img
            src={record.image_url || "/placeholder-image.png"}
            alt={record.title}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tags",
      key: "tags",
      render: (_, record) => (
        <div className={styles.tagsList}>
          {record.tags && record.tags.length > 0 ? (
            record.tags.map((tag) => (
              <span key={tag} className={styles.resourceTag}>
                {tag}
              </span>
            ))
          ) : (
            <span className={styles.noTags}>No tags</span>
          )}
        </div>
      ),
    },
    {
      title: "Date published",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleViewArticle(record)}>
            View
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteArticle(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const imagesColumns = [
    {
      title: "Image",
      key: "coverImage",
      render: (_, record) => (
        <div className={styles.coverImage}>
          <img
            src={record.file_url || "/placeholder-image.png"}
            alt="Gallery image"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tags",
      key: "tags",
      render: (_, record) => (
        <div className={styles.tagsList}>
          {record.tags && record.tags.length > 0 ? (
            record.tags.map((tag) => (
              <span key={tag} className={styles.resourceTag}>
                {tag}
              </span>
            ))
          ) : (
            <span className={styles.noTags}>No tags</span>
          )}
        </div>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size) => `${Math.round(size / 1024)} KB`,
    },
    {
      title: "Date added",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => window.open(record.file_url, "_blank")}
          >
            View
          </Button>
          <Button
            type="link"
            style={{ color: "#ff4d4f" }}
            onClick={() => handleDeleteResource(record, "image")}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const videosColumns = [
    {
      title: "Thumbnail",
      key: "thumbnail",
      render: (_, record) => {
        // Use file_url instead of thumbnail_url or url
        const thumbnailUrl = extractYoutubeThumbnail(record.file_url);
        return (
          <img 
            src={thumbnailUrl || '/placeholder-image.png'} 
            alt="Video thumbnail" 
            style={{ width: '80px', height: 'auto' , borderRadius: '12px'}}
          />
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tags",
      key: "tags",
      render: (_, record) => (
        <div className={styles.tagsList}>
          {record.tags && record.tags.length > 0 ? (
            record.tags.map((tag) => (
              <span key={tag} className={styles.resourceTag}>
                {tag}
              </span>
            ))
          ) : (
            <span className={styles.noTags}>No tags</span>
          )}
        </div>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size) => `${Math.round(size / 1024)} KB`,
    },
    {
      title: "Date added",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => window.open(record.file_url, "_blank")}
          >
            View
          </Button>
          <Button
            type="link"
            style={{ color: "#ff4d4f" }}
            onClick={() => handleDeleteResource(record, "video")}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const documentsColumns = [
    {
      title: "Doc type",
      key: "docType",
      render: (_, record) => {
        const extension = record.file_url.split(".").pop().toLowerCase();
        let icon = "📄";

        if (extension === "pdf") {
          icon = "📕";
        } else if (["doc", "docx"].includes(extension)) {
          icon = "📘";
        } else if (["xls", "xlsx"].includes(extension)) {
          icon = "📗";
        } else if (["ppt", "pptx"].includes(extension)) {
          icon = "📙";
        }

        return (
          <div className={styles.docIcon}>
            {icon} <span className={styles.docExtension}>.{extension}</span>
          </div>
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tags",
      key: "tags",
      render: (_, record) => (
        <div className={styles.tagsList}>
          {record.tags && record.tags.length > 0 ? (
            record.tags.map((tag) => (
              <span key={tag} className={styles.resourceTag}>
                {tag}
              </span>
            ))
          ) : (
            <span className={styles.noTags}>No tags</span>
          )}
        </div>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size) => `${Math.round(size / 1024)} KB`,
    },
    {
      title: "Date added",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => window.open(record.file_url, "_blank")}
          >
            View
          </Button>
          <Button
            type="link"
            style={{ color: "#ff4d4f" }}
            onClick={() => handleDeleteResource(record, "document")}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const getColumns = () => {
    switch (activeTab) {
      case "articles":
        return articlesColumns;
      case "images":
        return imagesColumns;
      case "videos":
        return videosColumns;
      case "documents":
        return documentsColumns;
      default:
        return articlesColumns;
    }
  };

  const items = [
    {
      key: "articles",
      label: "Articles",
    },
    {
      key: "images",
      label: "Images",
    },
    {
      key: "videos",
      label: "Videos",
    },
    {
      key: "documents",
      label: "Documents",
    },
  ];

  const handleCreateResource = async (values) => {
    try {
      const resourceType = values.resource_type;
      let response;

      // Format tags as an array
      const tags = values.tags ? values.tags.map((tag) => tag.trim()) : [];

      if (resourceType === "video") {
        // For videos, create a FormData object
        const formData = new FormData();
        formData.append("type", "video");
        formData.append("title", values.title);
        formData.append("description", values.description || "");
        formData.append("tags", JSON.stringify(tags));
        formData.append("url", values.url);

        response = await uploadGalleryItem(formData);
      } else if (resourceType === "image" || resourceType === "document") {
        // For images and documents, we need to handle file upload
        const file =
          resourceType === "image"
            ? values.image?.fileList[0]?.originFileObj
            : values.document?.fileList[0]?.originFileObj;

        if (!file) {
          message.error(`Please upload a ${resourceType}`);
          return;
        }

        // First upload the file to get the URL
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", resourceType);

        const uploadResponse = await uploadMediaFile(formData);

        if (uploadResponse.status && uploadResponse.data) {
          // Now create the gallery item with the file URL using FormData
          const galleryFormData = new FormData();
          galleryFormData.append("type", resourceType);
          galleryFormData.append("title", values.title);
          galleryFormData.append("description", values.description || "");
          galleryFormData.append("tags", JSON.stringify(tags));
          galleryFormData.append("url", uploadResponse.data.file_url);

          response = await uploadGalleryItem(galleryFormData);
        } else {
          throw new Error("File upload failed");
        }
      } else if (resourceType === "article") {
        // Article creation already uses FormData, no changes needed
        const file = values.cover_image?.fileList[0]?.originFileObj;

        if (!file) {
          message.error("Please upload a cover image");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("reading_time", values.read_time);
        formData.append("category", values.category);
        formData.append("tags", JSON.stringify(tags));
        formData.append("type", "article");

        response = await createArticle(formData);

        // ... rest of the article handling code remains the same
      }

      // ... rest of the function remains the same
    } catch (error) {
      console.error("Error creating resource:", error);
      message.error(
        "Failed to create resource: " + (error.message || "Unknown error")
      );
    }
  };

  const renderFormFields = () => {
    const resourceType = form.getFieldValue("resource_type");

    switch (resourceType) {
      case "article":
        return (
          <>
            <Form.Item
              name="title"
              label="Article title"
              rules={[
                { required: true, message: "Please enter article title" },
              ]}
            >
              <Input placeholder="Enter article title" />
            </Form.Item>

            <Form.Item
              name="read_time"
              label="Reading time"
              rules={[{ required: true, message: "Please enter reading time" }]}
            >
              <Input placeholder="e.g., 5 mins" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="mental_health">
                  Mental Health
                </Select.Option>
                <Select.Option value="wellness">Wellness</Select.Option>
                <Select.Option value="productivity">Productivity</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="Article content"
              rules={[
                { required: true, message: "Please enter article content" },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Write your article content here"
              />
            </Form.Item>

            <Form.Item
              name="cover_image"
              label="Cover image"
              rules={[{ required: true, message: "Please upload cover image" }]}
            >
              <Upload.Dragger
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Click or drag image to upload</p>
              </Upload.Dragger>
            </Form.Item>
          </>
        );

      case "video":
        return (
          <>
            <Form.Item
              name="title"
              label="Video title"
              rules={[{ required: true, message: "Please enter video title" }]}
            >
              <Input placeholder="Enter video title" />
            </Form.Item>

            <Form.Item
              name="url"
              label="Video URL"
              rules={[
                { required: true, message: "Please enter video URL" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder="Enter YouTube/video URL" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter video description" />
            </Form.Item>

            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* <Form.Item name="thumbnail" label="Thumbnail">
              <Upload.Dragger
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag thumbnail to upload
                </p>
              </Upload.Dragger>
            </Form.Item> */}
          </>
        );

      case "image":
        return (
          <>
            <Form.Item
              name="title"
              label="Image title"
              rules={[{ required: true, message: "Please enter image title" }]}
            >
              <Input placeholder="Enter image title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} placeholder="Enter image description" />
            </Form.Item>

            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="image"
              label="Upload Image"
              rules={[{ required: true, message: "Please upload an image" }]}
            >
              <Upload.Dragger
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Click or drag image to upload</p>
              </Upload.Dragger>
            </Form.Item>
          </>
        );

      case "document":
        return (
          <>
            <Form.Item
              name="title"
              label="Document title"
              rules={[
                { required: true, message: "Please enter document title" },
              ]}
            >
              <Input placeholder="Enter document title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={4}
                placeholder="Enter document description"
              />
            </Form.Item>

            {/* <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="guide">Guide</Select.Option>
                <Select.Option value="report">Report</Select.Option>
                <Select.Option value="template">Template</Select.Option>
              </Select>
            </Form.Item> */}

            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                placeholder="Add tags"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="document"
              label="Upload Document"
              rules={[{ required: true, message: "Please upload a document" }]}
            >
              <Upload.Dragger
                maxCount={1}
                beforeUpload={() => false}
                accept=".pdf,.doc,.docx"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag document to upload
                </p>
              </Upload.Dragger>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  const handleResourceTypeSelect = (value) => {
    setSelectedResourceType(value);
    form.setFieldsValue({ resource_type: value });
  };

  const handleDeleteResource = (record, type) => {
    Modal.confirm({
      title: "Are you sure you want to delete this resource?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Set the appropriate loading state based on resource type
          if (type === "image") {
            setImagesLoading(true);
          } else if (type === "video") {
            setVideosLoading(true);
          } else if (type === "document") {
            setDocumentsLoading(true);
          }

          const response = await deleteGalleryItem(record.id);

          if (response.status) {
            message.success(`${type} deleted successfully`);
            // Refresh the list after deletion
            if (type === "image") {
              fetchGalleryItems(
                "image",
                imagesPagination.current,
                imagesPagination.pageSize
              );
            } else if (type === "video") {
              fetchGalleryItems(
                "video",
                videosPagination.current,
                videosPagination.pageSize
              );
            } else if (type === "document") {
              fetchGalleryItems(
                "document",
                documentsPagination.current,
                documentsPagination.pageSize
              );
            }
          } else {
            throw new Error(`Failed to delete ${type}`);
          }
        } catch (error) {
          console.error(`Error deleting ${type}:`, error);
          message.error(`Failed to delete ${type}`);
        } finally {
          // Reset loading state
          if (type === "image") {
            setImagesLoading(false);
          } else if (type === "video") {
            setVideosLoading(false);
          } else if (type === "document") {
            setDocumentsLoading(false);
          }
        }
      },
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Resources</h1>

      <Tabs
        activeKey={activeTab}
        items={items}
        onChange={(key) => setActiveTab(key)}
        className={styles.tabs}
      />

      <div className={styles.actionBar}>
        <DatePicker.RangePicker className={styles.datePicker} />
        <Space>
          {/* <Button icon={<FilterOutlined />}>Filter</Button> */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateDrawerVisible(true)}
          >
            Add new
          </Button>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={getColumns()}
          dataSource={
            activeTab === "articles"
              ? articles
              : activeTab === "images"
              ? images
              : activeTab === "videos"
              ? videos
              : activeTab === "documents"
              ? documents
              : []
          }
          rowKey="id"
          loading={
            activeTab === "articles"
              ? loading
              : activeTab === "images"
              ? imagesLoading
              : activeTab === "videos"
              ? videosLoading
              : activeTab === "documents"
              ? documentsLoading
              : false
          }
          pagination={
            activeTab === "articles"
              ? {
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page, pageSize) => {
                    fetchArticles(page, pageSize);
                  },
                }
              : activeTab === "images"
              ? {
                  current: imagesPagination.current,
                  pageSize: imagesPagination.pageSize,
                  total: imagesPagination.total,
                  onChange: (page, pageSize) => {
                    fetchGalleryItems("image", page, pageSize);
                  },
                }
              : activeTab === "videos"
              ? {
                  current: videosPagination.current,
                  pageSize: videosPagination.pageSize,
                  total: videosPagination.total,
                  onChange: (page, pageSize) => {
                    fetchGalleryItems("video", page, pageSize);
                  },
                }
              : activeTab === "documents"
              ? {
                  current: documentsPagination.current,
                  pageSize: documentsPagination.pageSize,
                  total: documentsPagination.total,
                  onChange: (page, pageSize) => {
                    fetchGalleryItems("document", page, pageSize);
                  },
                }
              : {
                  pageSize: 10,
                  showSizeChanger: false,
                }
          }
          onChange={
            activeTab === "articles"
              ? handleTableChange
              : activeTab === "images"
              ? (newPagination) =>
                  handleGalleryTableChange(newPagination, "image")
              : activeTab === "videos"
              ? (newPagination) =>
                  handleGalleryTableChange(newPagination, "video")
              : activeTab === "documents"
              ? (newPagination) =>
                  handleGalleryTableChange(newPagination, "document")
              : undefined
          }
        />
      </div>

      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setCreateDrawerVisible(false)} />
            Add new resource
          </Space>
        }
        width={720}
        onClose={() => {
          setCreateDrawerVisible(false);
          setSelectedResourceType(null);
          form.resetFields();
        }}
        open={createDrawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateResource}>
          <Form.Item
            name="resource_type"
            label={<span className={styles.required}>Resource type</span>}
            rules={[{ required: true, message: "Please select resource type" }]}
          >
            <Select
              placeholder="Select resource type"
              onChange={handleResourceTypeSelect}
            >
              <Select.Option value="article">Article/blog</Select.Option>
              <Select.Option value="video">Video</Select.Option>
              <Select.Option value="image">Image</Select.Option>
              <Select.Option value="document">Document</Select.Option>
            </Select>
          </Form.Item>

          {selectedResourceType && renderFormFields()}

          {selectedResourceType && (
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Confirm
              </Button>
            </Form.Item>
          )}
        </Form>
      </Drawer>

      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setViewDrawerVisible(false)} />
            View Article
          </Space>
        }
        width={720}
        onClose={() => setViewDrawerVisible(false)}
        open={viewDrawerVisible}
        className={styles.articleDrawer}
        extra={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setViewDrawerVisible(false);
                handleEditArticle(selectedArticle);
              }}
            >
              Edit
            </Button>
          </Space>
        }
      >
        {selectedArticle && (
          <div className={styles.articleView}>
            <div className={styles.articleHeader}>
              <img
                src={selectedArticle.image_url || "/placeholder-image.png"}
                alt={selectedArticle.title}
                className={styles.articleImage}
              />
              <h2>{selectedArticle.title}</h2>
              <div className={styles.articleMeta}>
                <span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6v6h4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {selectedArticle.reading_time} min read
                </span>
                <span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.568 3h4.864c2.066 0 3.1 0 3.887.402a3.75 3.75 0 0 1 1.78 1.78c.401.788.401 1.821.401 3.887v5.862c0 2.066 0 3.1-.402 3.887a3.75 3.75 0 0 1-1.78 1.78c-.788.401-1.821.401-3.887.401H9.568c-2.066 0-3.1 0-3.887-.402a3.75 3.75 0 0 1-1.78-1.78C3.5 18.03 3.5 16.997 3.5 14.93V9.07c0-2.066 0-3.1.402-3.887a3.75 3.75 0 0 1 1.78-1.78C6.47 3 7.502 3 9.568 3z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 12h7M8.5 7.5H12M8.5 16.5h5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {selectedArticle.category}
                </span>
                <span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.995 13.7h.01M8.294 13.7h.01M8.294 16.7h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {new Date(selectedArticle.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className={styles.articleTags}>
                  {selectedArticle.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.articleContent}>
              {selectedArticle.content
                .split("\n")
                .map((paragraph, index) =>
                  paragraph ? (
                    <p key={index}>{paragraph}</p>
                  ) : (
                    <br key={index} />
                  )
                )}
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setEditDrawerVisible(false)} />
            Edit Article
          </Space>
        }
        width={720}
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateArticle}>
          <Form.Item
            name="title"
            label="Article title"
            rules={[{ required: true, message: "Please enter article title" }]}
          >
            <Input placeholder="Enter article title" />
          </Form.Item>

          <Form.Item
            name="read_time"
            label="Reading time"
            rules={[{ required: true, message: "Please enter reading time" }]}
          >
            <Input placeholder="e.g., 5 mins" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="Mental Health">Mental Health</Select.Option>
              <Select.Option value="Wellness">Wellness</Select.Option>
              <Select.Option value="Productivity">Productivity</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Article content"
            rules={[
              { required: true, message: "Please enter article content" },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Write your article content here"
            />
          </Form.Item>

          <Form.Item name="cover_image" label="Cover image">
            <Upload.Dragger
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
              showUploadList={{ showPreviewIcon: true }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag to replace image</p>
              <p className="ant-upload-hint">
                Leave empty to keep current image
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Article
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Resources;
