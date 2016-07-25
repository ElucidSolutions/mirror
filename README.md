Mirror Readme
=============

The Mirror utility can be used to mirror local directories on remote
servers over using rsync. When run, this utility will periodically
fork a rsync process for each connection listed in mirror.json. These
rsync processes will scan the local directory that they are
associated with for any changes and immediately mirror those
changes in the associated remote directory.

This program provides a webinterface on port 3000. You can view, start,
and stop connections using this interface by navigating your browser to
http://localhost:3000.

This utility was created as part of Elucid's Standard Dev Environment
specification.

Tips
====

1. Local File Paths in Rsync (Linux)

   The local_path directory must end in a backslash when using Mirror 
   under Linux. Rsync will only copy the contents of local_path to
   remote_path if it ends in a backslash. 

2. Using Identity Files

   Amazon Web Services (AWS) uses SSH identity files for user
   authentication. Unlike SSH, Rsync does not have a flag through
   which an identity file can be given. Rsync however, uses SSH
   to connect to remote servers and will respect any settings in
   the ~/.ssh/config file. Add an "IdentityFile FILE" directive to
   those hosts that require one.
   
   Example:
   
   >  Host 54.4.197.127
   >  User ubuntu
   >  IdentityFile ~/.ssh/example.pem

   Where example.pem is the PEM file provided by AWS.


Known Issues
============

Author
======

Larry Lee <larry_lee@elucidsolutions.com>
