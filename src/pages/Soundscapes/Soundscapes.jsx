import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Space,
  Upload,
  Drawer,
  Form,
  Input,
  Select,
  message,
  Modal,
} from "antd";
import {
  FilterOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  PauseOutlined,
} from "@ant-design/icons";
import { getSoundscapes, createSoundscape, deleteSoundscape } from "../../services/api";
import styles from "./Soundscapes.module.css";
import * as musicMetadata from "music-metadata-browser";

const Soundscapes = () => {
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [soundscapes, setSoundscapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Add new state for audio player modal
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to fetch soundscapes (simplified)
  const fetchSoundscapes = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getSoundscapes({ page, limit });
      if (response.status && response.data) {
        const processedSoundscapes = response.data.soundscapes.map((item) => ({
          ...item,
          key: item.id,
          dateAdded: new Date(item.created_at).toLocaleDateString(),
          category: "Music",
        }));

        setSoundscapes(processedSoundscapes);
        setPagination({
          current: response.data.pagination.currentPage,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching soundscapes:", error);
      message.error("Failed to load soundscapes");
    } finally {
      setLoading(false);
    }
  };

  // Function to get audio metadata (duration and size)
  const getAudioMetadata = async (url) => {
    try {
      // Attempt to get metadata using music-metadata-browser
      const metadata = await musicMetadata.fetchFromUrl(url);

      // Get duration from metadata
      const duration = metadata.format.duration || 0;

      // Get file size from metadata or estimate it
      let size = metadata.format.byteSize;

      // If size is not available, estimate based on duration and bitrate
      if (!size && metadata.format.bitrate) {
        size = Math.round((duration * metadata.format.bitrate) / 8);
      } else if (!size) {
        // Fallback to estimation with standard bitrate
        size = Math.round((duration * 192 * 1024) / 8);
      }

      return { duration, size };
    } catch (error) {
      console.error("Error fetching audio metadata:", error);

      // Fallback to the Audio API method
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.src = url;

        let durationResolved = false;

        audio.addEventListener("loadedmetadata", () => {
          if (!durationResolved) {
            const duration = audio.duration || 0;

            if (!isFinite(duration) || duration === 0) {
              resolve({ duration: 180, size: 4 * 1024 * 1024 });
              durationResolved = true;
              return;
            }

            const estimatedSize = Math.round((duration * 192 * 1024) / 8);

            durationResolved = true;
            resolve({ duration, size: estimatedSize });

            audio.pause();
            audio.src = "";
          }
        });

        audio.addEventListener("error", () => {
          if (!durationResolved) {
            durationResolved = true;
            resolve({ duration: 180, size: 4 * 1024 * 1024 });
          }
        });

        setTimeout(() => {
          if (!durationResolved) {
            durationResolved = true;
            resolve({ duration: 180, size: 4 * 1024 * 1024 });
          }
        }, 5000);

        audio.load();
      });
    }
  };

  // Format duration to mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format size to KB/MB
  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  };

  // Fetch soundscapes on component mount
  useEffect(() => {
    fetchSoundscapes();
  }, []);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchSoundscapes(newPagination.current, newPagination.pageSize);
  };

  // Handle play button click
  const handlePlay = (record) => {
    setCurrentAudio(record);
    setPlayModalVisible(true);
  };

  // Handle audio play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset audio player when modal closes
  const handleCloseModal = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayModalVisible(false);
  };

  // Handle delete confirmation
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this soundscape?",
      content: `This will permanently delete "${record.title}".`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Call the delete API with the soundscape ID
          const response = await deleteSoundscape(record.id);
          
          if (response && response.status) {
            message.success(`Deleted soundscape: ${record.title}`);
            // After successful deletion, refresh the list
            fetchSoundscapes(pagination.current, pagination.pageSize);
          } else {
            throw new Error("Failed to delete soundscape");
          }
        } catch (error) {
          console.error("Error deleting soundscape:", error);
          message.error("Failed to delete soundscape: " + (error.message || "Unknown error"));
        }
      },
    });
  };

  // Effect to handle audio events
  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const handleEnded = () => {
        setIsPlaying(false);
      };

      audioElement.addEventListener("ended", handleEnded);

      return () => {
        audioElement.removeEventListener("ended", handleEnded);
      };
    }
  }, [currentAudio]);

  const columns = [
    {
      title: "Album art",
      key: "albumArt",
      render: (_, record) => (
        <div className={styles.albumArt}>
          <img
            src={record.sound_cover_image}
            alt="Album Art"
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
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Date added",
      dataIndex: "dateAdded",
      key: "dateAdded",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlay(record)}
          >
            Play
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // ... existing code ...

  const handleCreateSoundscape = async (values) => {
    try {
      // Get the file objects from the Upload components
      const coverImageFile = values.cover_image?.fileList[0]?.originFileObj;
      const audioFile = values.music_file?.fileList[0]?.originFileObj;

      if (!coverImageFile || !audioFile) {
        message.error("Please upload both cover image and audio file");
        return;
      }

      // Create FormData object
      const formData = new FormData();

      // Append files with the specified keys
      formData.append("coverImage", coverImageFile);
      formData.append("audio", audioFile);

      // Append other form data
      formData.append("title", values.music_title);
      formData.append("artistName", values.artist_name);
      formData.append("category", values.category);

      // Format tags as a JSON string array
      const tags = values.tags
        ? JSON.stringify(values.tags)
        : JSON.stringify([]);
      formData.append("tags", tags);

      // Call the API
      const response = await createSoundscape(formData);

      if (response && response.status) {
        message.success("Soundscape created successfully");
        // Refresh the soundscapes list
        fetchSoundscapes(pagination.current, pagination.pageSize);
        setCreateDrawerVisible(false);
        form.resetFields();
      } else {
        throw new Error("Failed to create soundscape");
      }
    } catch (error) {
      console.error("Error creating soundscape:", error);
      message.error(
        "Failed to create soundscape: " + (error.message || "Unknown error")
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Soundscape</h1>
      </div>

      <div className={styles.actionBar}>
        <Button icon={<FilterOutlined />}>Filter</Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateDrawerVisible(true)}
        >
          Add new
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={soundscapes}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} soundscapes`,
          }}
          scroll={{ x: "max-content" }}
          onChange={handleTableChange}
        />
      </div>

      {/* Audio Player Modal */}
      <Modal
        title={currentAudio?.title || "Play Soundscape"}
        open={playModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        centered
      >
        <div className={styles.audioPlayerContainer}>
          <div className={styles.audioImageContainer}>
            {currentAudio && (
              <img
                src={currentAudio.sound_cover_image}
                alt={currentAudio.title}
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                }}
              />
            )}
          </div>
          <div className={styles.audioControls}>
            <div className={styles.audioInfo}>
              <p>
                <strong>Artist:</strong> {currentAudio?.author || "Unknown"}
              </p>
              <p>
                <strong>Length:</strong> {currentAudio?.length || "00:00"}
              </p>
            </div>
          </div>
          {currentAudio && (
            <audio
              ref={audioRef}
              src={currentAudio.sound_file_url}
              style={{ width: "100%", marginTop: "20px" }}
              controls
            />
          )}
        </div>
      </Modal>

      <Drawer
        title={
          <Space>
            <ArrowLeftOutlined onClick={() => setCreateDrawerVisible(false)} />
            Add new soundscape
          </Space>
        }
        width={720}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSoundscape}>
          <Form.Item label="Uploads" style={{ marginBottom: 24 }}>
            <Space size={16} direction="vertical" style={{ width: "100%" }}>
              <Form.Item
                name="cover_image"
                rules={[
                  { required: true, message: "Please upload a cover image" },
                ]}
                noStyle
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                  accept="image/*"
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload Cover Image</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item
                name="music_file"
                rules={[
                  { required: true, message: "Please upload an audio file" },
                ]}
                noStyle
              >
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  accept="audio/*"
                >
                  <Button icon={<UploadOutlined />}>Upload Audio File</Button>
                </Upload>
              </Form.Item>
            </Space>
          </Form.Item>

          {/* Rest of the form remains the same */}
          <Form.Item
            name="music_title"
            label="Music Title"
            rules={[{ required: true, message: "Please enter music title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="artist_name"
            label="Artist name"
            rules={[{ required: true, message: "Please enter artist name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Mind">
              <Select.Option value="mind">Mind</Select.Option>
              <Select.Option value="relax">Relax</Select.Option>
              <Select.Option value="focus">Focus</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="Tags & keywords">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Add tags"
              open={false}
            />
          </Form.Item>

          <Form.Item className={styles.submitButton}>
            <Button type="primary" htmlType="submit" block>
              Confirm
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Soundscapes;
