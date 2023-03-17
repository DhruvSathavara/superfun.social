import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Avatar, CircularProgress, Divider } from '@mui/material';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { createPost, createPostViaDis } from '../../lensprotocol/post/create-post';
import { LensAuthContext } from '../../context/LensContext';
import { Buffer } from 'buffer';
import { createNftPost, createNftPostViaDis } from '../../lensprotocol/createNft/create-nft';
import { create } from 'ipfs-http-client';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { toast } from 'react-toastify';
import { createPostByDispatcher } from '../../lensprotocol/post/dispatcher/post-despatcher';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

import Tooltip from '@mui/material/Tooltip';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImages, faFileVideo, faFileText } from '@fortawesome/free-regular-svg-icons'
import CancelIcon from '@mui/icons-material/Cancel';
import VideocamIcon from '@mui/icons-material/Videocam';


const auth =
  "Basic " +
  Buffer.from(
    process.env.REACT_APP_INFURA_PID + ":" + process.env.REACT_APP_INFURA_SECRET
  ).toString("base64");
 

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});


const ColorButton = styled(Button)(({ theme }) => ({
    color: 'white',
    margin: '0 10px',
    background: 'linear-gradient(to right top, #ff0f7b, #ff3d61, #ff6049, #ff7f36, #f89b29);',
    '&:hover': {
        background: 'linear-gradient(to left top, #ff0f7b, #ff3d61, #ff6049, #ff7f36, #f89b29);',
    },
}));


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
    '&.MuiBackdrop-root': {
        backgroundColor: 'rgba(225, 225, 225, .8)',
    }
}));

function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
}


BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};



export default function CreateNftModal() {
    
    const lensAuthContext = React.useContext(LensAuthContext);
    const { profile, login, update, setUpdate } = lensAuthContext;
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");

    const [file, setFile] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [amount, setAmount] = React.useState();
    const [noOfNFTs, setNoOfNFT] = React.useState()
    const [open, setOpen] = React.useState(false)

    const inputRef = React.useRef();
    const [source, setSource] = React.useState("");

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        const ipfsResult = await client.add(file);
        const imageURI = `https://superfun.infura-ipfs.io/ipfs/${ipfsResult.path}`;
        console.log(imageURI,'video link');
        setSource(imageURI);
    };

    const handleClickOpenSell = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFile("");
        setTitle("");
        setSource("");
        setDescription("");
    };


    const handleUpload = async () => {
        const fId = window.localStorage.getItem("profileId");
        if (title.length !== 0 && (file !== "" || source !== "")) {
            if (fId === undefined) {
                toast.error("Please Login First!");
                return;
            }
            var res;
            var media;
            if (file !== '') {
                media = 'image';
            } else {
                media = 'video';
            }
            try {

                setLoading(true);
                const postData = {
                    title: title,
                    photo: file,
                    amount: amount,
                    noOfNFTs: noOfNFTs,
                    login: login,
                    description: description,
                    video: source,
                    name: profile.handle,
                    profile: profile,
                    fileTyepe: media
                }
                if (profile?.dispatcher?.canUseRelay) {
                    res = await createNftPostViaDis(postData);
                } else {
                    res = await createNftPost(postData);
                }
                if (res) {
                    setUpdate(!update);
                    setFile("");
                    setTitle("");
                    setDescription("");
                    setLoading(false);
                    toast.success("Added Asset Successfully!");
                    setOpen(false);
                }
            } catch (error) {
                toast.error(error);
                setLoading(false);
                setUpdate(!update);
            }
        } else {
            toast.error("Required all the fields!");
        }

    }


    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
         console.log(file,'fl');
        const ipfsResult = await client.add(file);
        const imageURI = `https://superfun.infura-ipfs.io/ipfs/${ipfsResult.path}`;
        console.log(imageURI,'img link');
        setFile(imageURI);

    }

    const handleRemoveVideo = () => {
        setSource("");
        setFile("");
    }
    return (

        <div>
            <Button className='m-2' style={{ background: '#F66A24', color: 'white', textTransform: 'capitalize' }} onClick={handleClickOpenSell}  >Sell Assets</ Button>
            <BootstrapDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth style={{ borderRadius: '30px' }}>
                <BootstrapDialogTitle onClose={handleClose}>Sell Assets</BootstrapDialogTitle>

                <DialogContent dividers >

                    <div>
                        <input onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Title" className="title" /><br></br>

                        <textarea onChange={(e) => setDescription(e.target.value)} rows={3} type="text" placeholder="Description" className="title" />

                        <input
                            onChange={(e) => setAmount(e.target.value)}
                            type="number" placeholder="Amount" className="title" />
                        <br></br>
                        <br></br>

                        <input
                            onChange={(e) => setNoOfNFT(e.target.value)}
                            type="number" placeholder="Number of NFTs" className="title" />
                        <br></br>
                        <br></br>

                    </div>


                    {/* {
                        file !== "" && <div className='d-flex justify-content-between'><img style={{ borderRadius: '10px' }} height="200px" className="p-2" src={file}></img><CancelIcon style={{ fontSize: '24px', }} onClick={handleRemoveVideo} /></div>
                    }
                    {source && (
                        <div className='d-flex justify-content-between '>
                            <video
                                className="VideoInput_video"
                                width="100%"
                                height="250px"
                                controls
                                src={source}
                            />
                            <CancelIcon style={{ fontSize: '24px', }} onClick={handleRemoveVideo} />
                        </div>
                    )} */}

                    {
                        <div className='d-flex mt-2'>
                            {
                                file === "" && source === "" && <Tooltip title="Upload Image">
                                    <IconButton
                                        size="small"
                                        sx={{ ml: 2 }}
                                    >
                                        <input
                                            onChange={(e) => handleUploadImage(e)}
                                            type="file"
                                            name="file"
                                            id="file"
                                            className="input-file d-none" />
                                        <label
                                            htmlFor="file"
                                            style={{ width: '100%', cursor: 'pointer' }}
                                            className="rounded-3 text-center p-1   js-labelFile   " >
                                            <FontAwesomeIcon color='#F66A24' size="lg" icon={faImages} />
                                        </label>
                                    </IconButton>
                                </Tooltip>
                            }
                            {
                                source === "" && file === "" && <Tooltip title="Upload Video">
                                    <IconButton
                                        size="small"
                                        sx={{ ml: 2 }}
                                    >
                                        <input
                                            ref={inputRef}
                                            className="input-file d-none"
                                            type="file"
                                            name="video"
                                            id="video"
                                            onChange={(e) => handleFileChange(e)}
                                            accept=".mov,.mp4"
                                        />
                                        <label
                                            htmlFor="video"
                                            style={{ width: '100%', cursor: 'pointer', padding: '2px 10px' }}
                                            className="rounded-3 text-center   js-labelFile " >
                                            <FontAwesomeIcon color='#468f72' size="lg" icon={faFileVideo} />
                                        </label>
                                    </IconButton>
                                </Tooltip>
                            }
                        </div>
                    }

                </DialogContent>
                <DialogActions className='d-flex justify-content-end'>
                    <ColorButton onClick={handleClose}>Cancel</ColorButton>
                    <ColorButton onClick={handleUpload}>{loading ? <CircularProgress size={20} /> : "Sell Assets"}</ColorButton>

                </DialogActions>
            </BootstrapDialog>
        </div >
    );
}