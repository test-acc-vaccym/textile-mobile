// Objective-C API for talking to github.com/textileio/textile-go/mobile Go package.
//   gobind -lang=objc github.com/textileio/textile-go/mobile
//
// File is generated by gobind. Do not edit.

#ifndef __Mobile_H__
#define __Mobile_H__

@import Foundation;
#include "Universe.objc.h"

#include "Net.objc.h"

@class MobileBlocks;
@class MobileEvent;
@class MobileMobile;
@class MobileNodeConfig;
@class MobileWrapper;
@protocol MobileMessenger;
@class MobileMessenger;

@protocol MobileMessenger <NSObject>
- (void)notify:(MobileEvent*)event;
@end

/**
 * Blocks is a wrapper around a list of Blocks, which makes decoding json from a little cleaner
on the mobile side
 */
@interface MobileBlocks : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) id _ref;

- (instancetype)initWithRef:(id)ref;
- (instancetype)init;
// skipped field Blocks.Items with unsupported type: *types.Slice

@end

/**
 * Message is a generic go -> bridge message structure
 */
@interface MobileEvent : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) id _ref;

- (instancetype)initWithRef:(id)ref;
- (instancetype)init;
- (NSString*)name;
- (void)setName:(NSString*)v;
- (NSString*)payload;
- (void)setPayload:(NSString*)v;
@end

/**
 * Mobile is the name of the framework (must match package name)
 */
@interface MobileMobile : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) id _ref;

- (instancetype)initWithRef:(id)ref;
- (instancetype)init;
/**
 * Create a gomobile compatible wrapper around TextileNode
 */
- (MobileWrapper*)newNode:(MobileNodeConfig*)config messenger:(id<MobileMessenger>)messenger error:(NSError**)error;
@end

/**
 * NodeConfig is used to configure the mobile node
 */
@interface MobileNodeConfig : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) id _ref;

- (instancetype)initWithRef:(id)ref;
- (instancetype)init;
- (NSString*)repoPath;
- (void)setRepoPath:(NSString*)v;
- (NSString*)centralApiURL;
- (void)setCentralApiURL:(NSString*)v;
- (NSString*)logLevel;
- (void)setLogLevel:(NSString*)v;
- (BOOL)logFiles;
- (void)setLogFiles:(BOOL)v;
@end

/**
 * Wrapper is the object exposed in the frameworks
 */
@interface MobileWrapper : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) id _ref;

- (instancetype)initWithRef:(id)ref;
- (instancetype)init;
- (NSString*)repoPath;
- (void)setRepoPath:(NSString*)v;
/**
 * AddPhoto adds a photo by path and shares it to the default thread
 */
- (NetMultipartRequest*)addPhoto:(NSString*)path threadName:(NSString*)threadName caption:(NSString*)caption error:(NSError**)error;
/**
 * AddThread adds a new thread with the given name
 */
- (BOOL)addThread:(NSString*)name mnemonic:(NSString*)mnemonic error:(NSError**)error;
/**
 * GetAccessToken calls core GetAccessToken
 */
- (NSString*)getAccessToken:(NSError**)error;
/**
 * GetBlockData calls GetBlockDataBase64 on a thread
 */
- (NSString*)getBlockData:(NSString*)id_ path:(NSString*)path error:(NSError**)error;
/**
 * GetFileData calls GetFileDataBase64 on a thread
 */
- (NSString*)getFileData:(NSString*)id_ path:(NSString*)path error:(NSError**)error;
/**
 * GetIPFSPeerId returns the wallet's ipfs peer id
 */
- (NSString*)getIPFSPeerId:(NSError**)error;
/**
 * GetId calls core GetId
 */
- (NSString*)getId:(NSError**)error;
/**
 * GetPhotoBlocks returns thread photo blocks with json encoding
 */
- (NSString*)getPhotoBlocks:(NSString*)offsetId limit:(long)limit threadName:(NSString*)threadName error:(NSError**)error;
/**
 * GetUsername calls core GetUsername
 */
- (NSString*)getUsername:(NSError**)error;
/**
 * IsSignedIn calls core IsSignedIn
 */
- (BOOL)isSignedIn;
/**
 * PairDevice publishes this node's secret key to another node,
which is listening at it's own peer id
 */
- (NSString*)pairDevice:(NSString*)pkb64 error:(NSError**)error;
/**
 * SharePhoto adds an existing photo to a new thread
 */
- (NSString*)sharePhoto:(NSString*)id_ threadName:(NSString*)threadName caption:(NSString*)caption error:(NSError**)error;
/**
 * SignIn build credentials and calls core SignIn
 */
- (BOOL)signIn:(NSString*)username password:(NSString*)password error:(NSError**)error;
/**
 * SignOut calls core SignOut
 */
- (BOOL)signOut:(NSError**)error;
/**
 * SignUpWithEmail creates an email based registration and calls core signup
 */
- (BOOL)signUpWithEmail:(NSString*)username password:(NSString*)password email:(NSString*)email referral:(NSString*)referral error:(NSError**)error;
/**
 * Start the mobile node
 */
- (BOOL)start:(NSError**)error;
/**
 * Stop the mobile node
 */
- (BOOL)stop:(NSError**)error;
@end

/**
 * NewNode is the mobile entry point for creating a node
NOTE: logLevel is one of: CRITICAL ERROR WARNING NOTICE INFO DEBUG
 */
FOUNDATION_EXPORT MobileWrapper* MobileNewNode(MobileNodeConfig* config, id<MobileMessenger> messenger, NSError** error);

@class MobileMessenger;

/**
 * Messenger is used to inform the bridge layer of new data waiting to be queried
 */
@interface MobileMessenger : NSObject <goSeqRefInterface, MobileMessenger> {
}
@property(strong, readonly) id _ref;

- (instancetype)initWithRef:(id)ref;
- (void)notify:(MobileEvent*)event;
@end

#endif
